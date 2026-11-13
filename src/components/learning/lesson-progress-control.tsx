"use client";

import { Check, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import {
  isGuestLessonComplete,
  setGuestLessonCompletion,
  touchGuestEnrollment,
} from "@/learning/guest-storage";

export function LessonProgressControl({
  courseId,
  lessonId,
  authenticated,
}: {
  courseId: string;
  lessonId: string;
  authenticated: boolean;
}) {
  const [completed, setCompleted] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!authenticated) {
      touchGuestEnrollment(courseId);
      const timer = window.setTimeout(() => {
        setCompleted(isGuestLessonComplete(courseId, lessonId));
        setReady(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const controller = new AbortController();
    const query = new URLSearchParams({ courseId, lessonId });
    // Opening a published lesson records a safe resume point by ensuring the
    // course is present in the learner's list. The POST derives the user from
    // the verified session and never accepts a user ID.
    void Promise.all([
      fetch("/api/learning/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
        signal: controller.signal,
      }),
      fetch(`/api/learning/lesson-progress?${query}`, {
        cache: "no-store",
        signal: controller.signal,
      }),
    ]).then(async ([enrollmentResponse, progressResponse]) => {
      if (!enrollmentResponse.ok || !progressResponse.ok) throw new Error();
      const data = await progressResponse.json() as { completed: boolean };
      setCompleted(data.completed);
    }).catch(() => {
      if (!controller.signal.aborted) setMessage("Progress could not be synchronized.");
    }).finally(() => {
      if (!controller.signal.aborted) setReady(true);
    });
    return () => controller.abort();
  }, [authenticated, courseId, lessonId]);

  async function toggle() {
    if (saving) return;
    const next = !completed;
    setSaving(true);
    setMessage(undefined);
    if (!authenticated) {
      const result = setGuestLessonCompletion(courseId, lessonId, next);
      if (result.written) setCompleted(next);
      else setMessage("This browser blocked local progress storage.");
      setSaving(false);
      return;
    }
    try {
      const response = await fetch("/api/learning/lesson-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, completed: next }),
      });
      if (!response.ok) throw new Error();
      setCompleted(next);
    } catch {
      setMessage("Progress could not be saved. Your previous state is unchanged.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className={`my-8 rounded-3xl border p-6 ${completed ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"}`} aria-labelledby="lesson-progress-heading">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Lesson progress</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white" id="lesson-progress-heading">
            {completed ? "Lesson completed" : "Finished reading?"}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {authenticated ? "This status syncs to your dashboard." : "This status stays in this browser unless you later choose to import it."}
          </p>
        </div>
        <button
          aria-pressed={completed}
          className={completed ? "button-secondary shrink-0 justify-center" : "button-primary shrink-0 justify-center"}
          disabled={!ready || saving}
          onClick={toggle}
          type="button"
        >
          {!ready || saving ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : completed ? <RotateCcw aria-hidden="true" className="size-4" /> : <Check aria-hidden="true" className="size-4" />}
          {completed ? "Mark incomplete" : "Mark as complete"}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400" role="status">{message}</p> : null}
    </aside>
  );
}
