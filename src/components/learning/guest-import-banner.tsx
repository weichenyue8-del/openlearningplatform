"use client";

import { CloudUpload, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { readGuestLearningStore } from "@/learning/guest-storage";
import type { GuestImportReport, GuestLearningImport } from "@/lib/learning/guest-import";
import { readPracticeSessions } from "@/practice/storage";
import { readResourceBookmarks } from "@/resources/storage";

const ACK_KEY = "openap.guest-import.ack.v1";

function snapshot(): GuestLearningImport {
  const learning = readGuestLearningStore();
  return {
    version: 1,
    enrollments: learning.enrollments,
    lessonProgress: learning.lessonProgress,
    bookmarks: readResourceBookmarks().map((item) => ({
      resourceId: item.resourceId,
      savedAt: item.savedAt,
    })),
    practiceSessions: readPracticeSessions().map((session) => ({
      sourceId: session.id,
      courseId: session.courseId,
      questionIds: session.questionIds,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      attempts: session.attempts.map((attempt) => ({
        sourceId: `${session.id}:${attempt.question.id}`,
        questionId: attempt.question.id,
        answer: attempt.submittedAnswer,
        submittedAt: attempt.submittedAt,
      })),
    })),
  };
}

function fingerprint(value: GuestLearningImport) {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${text.length}:${(hash >>> 0).toString(16)}`;
}

export function GuestImportBanner({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<GuestLearningImport>();
  const [dismissed, setDismissed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<GuestImportReport>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = snapshot();
      const currentFingerprint = fingerprint(current);
      if (window.localStorage.getItem(ACK_KEY) !== currentFingerprint) setData(current);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const counts = useMemo(() => data ? {
    courses: data.enrollments.length,
    lessons: data.lessonProgress.length,
    bookmarks: data.bookmarks.length,
    attempts: data.practiceSessions.reduce((sum, session) => sum + session.attempts.length, 0),
  } : null, [data]);
  const total = counts ? counts.courses + counts.lessons + counts.bookmarks + counts.attempts : 0;

  if (!data || total === 0 || dismissed) return null;

  async function importData() {
    if (!data) return;
    const currentData = data;
    setImporting(true);
    setError(undefined);
    try {
      const response = await fetch("/api/learning/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData),
      });
      const result = await response.json() as GuestImportReport | { error: string };
      if (!response.ok || !("status" in result)) {
        throw new Error("error" in result ? result.error : "Import failed.");
      }
      setReport(result);
      if (result.status === "complete") {
        window.localStorage.setItem(ACK_KEY, fingerprint(currentData));
        router.refresh();
      }
    } catch {
      setError("Browser progress could not be imported. Nothing was cleared; you can try again.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className={`rounded-3xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 ${compact ? "mb-8 p-5" : "mb-8 p-6 sm:p-7"}`} aria-labelledby="guest-import-heading">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><CloudUpload aria-hidden="true" className="size-5" /></span>
          <div>
            <h2 className="font-bold text-slate-950 dark:text-white" id="guest-import-heading">Import progress from this browser?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Found {counts?.courses ?? 0} courses, {counts?.lessons ?? 0} lesson records, {counts?.bookmarks ?? 0} bookmarks, and {counts?.attempts ?? 0} practice attempts. Nothing is uploaded until you confirm.
            </p>
          </div>
        </div>
        <button className="rounded-lg p-2 text-slate-500 hover:bg-white/70 dark:hover:bg-slate-900" onClick={() => setDismissed(true)} type="button"><span className="sr-only">Not now</span><X aria-hidden="true" className="size-4" /></button>
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Answers are re-graded on the server, unknown IDs are skipped, newer cloud progress wins, and the browser copy is kept as a backup.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="button-primary" disabled={importing} onClick={importData} type="button">{importing ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <CloudUpload aria-hidden="true" className="size-4" />}Import selected browser data</button>
        <button className="button-secondary" onClick={() => setDismissed(true)} type="button">Not now</button>
      </div>
      {report ? <p className={`mt-4 text-sm ${report.status === "complete" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"}`} role="status">{report.status === "complete" ? "Import complete." : "Import partly completed; the remaining browser data was kept for retry."} Imported {Object.values(report.imported).reduce((sum, value) => sum + value, 0)} records.</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-700 dark:text-rose-300" role="alert">{error}</p> : null}
    </section>
  );
}
