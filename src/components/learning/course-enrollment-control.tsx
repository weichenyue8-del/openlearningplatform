"use client";

import { BookmarkCheck, LoaderCircle, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  isGuestEnrolled,
  removeGuestEnrollment,
  touchGuestEnrollment,
} from "@/learning/guest-storage";

export function CourseEnrollmentControl({
  courseId,
  authenticated,
}: {
  courseId: string;
  authenticated: boolean;
}) {
  const [enrolled, setEnrolled] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!authenticated) {
      const timer = window.setTimeout(() => {
        setEnrolled(isGuestEnrolled(courseId));
        setReady(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const controller = new AbortController();
    void fetch(`/api/learning/enrollments?courseId=${encodeURIComponent(courseId)}`, {
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error();
      const data = await response.json() as { enrolled: boolean };
      setEnrolled(data.enrolled);
    }).catch(() => {
      if (!controller.signal.aborted) setMessage("Enrollment status could not be loaded.");
    }).finally(() => {
      if (!controller.signal.aborted) setReady(true);
    });
    return () => controller.abort();
  }, [authenticated, courseId]);

  async function toggle() {
    if (saving) return;
    setSaving(true);
    setMessage(undefined);
    const next = !enrolled;
    if (!authenticated) {
      const written = next
        ? touchGuestEnrollment(courseId).written
        : removeGuestEnrollment(courseId);
      if (written) setEnrolled(next);
      else setMessage("This browser blocked local progress storage.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/learning/enrollments", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!response.ok) throw new Error();
      setEnrolled(next);
    } catch {
      setMessage("Your learning list could not be updated. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        aria-pressed={enrolled}
        className="button-secondary w-full justify-center disabled:cursor-wait disabled:opacity-60"
        disabled={!ready || saving}
        onClick={toggle}
        type="button"
      >
        {!ready || saving ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : enrolled ? <X aria-hidden="true" className="size-4" /> : <Plus aria-hidden="true" className="size-4" />}
        {enrolled ? "Remove from My Learning" : "Add to My Learning"}
      </button>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <BookmarkCheck aria-hidden="true" className="size-3.5" />
        {authenticated ? "Synced with your OpenAP account." : "Saved in this browser until you choose to import it."}
      </p>
      {message ? <p className="mt-2 text-xs text-rose-600 dark:text-rose-400" role="status">{message}</p> : null}
    </div>
  );
}
