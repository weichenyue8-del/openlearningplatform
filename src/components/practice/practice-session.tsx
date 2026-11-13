"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  DoorOpen,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { MathFormula } from "@/components/lesson/math-formula";
import { Logo } from "@/components/site/logo";
import { isSessionComplete } from "@/practice/analytics";
import { prioritizePublicQuestionIds } from "@/practice/recommendation";
import {
  createSafeSessionId,
  getAllStoredAttempts,
  getPracticeSession,
  sanitizeReturnPath,
  upsertPracticeSession,
} from "@/practice/storage";
import type {
  AnswerValue,
  Difficulty,
  EvaluationFailure,
  EvaluationSuccess,
  PracticeQuestionMeta,
  PracticeSession as PracticeSessionRecord,
  PublicPracticeQuestion,
  SessionFilters,
  StoredAttempt,
} from "@/practice/types";

const difficultyStyles: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  hard: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

function questionToMeta(question: PublicPracticeQuestion): PracticeQuestionMeta {
  return {
    id: question.id,
    courseId: question.courseId,
    unitId: question.unitId,
    unitLabel: question.unitLabel,
    topicId: question.topicId,
    topicLabel: question.topicLabel,
    lessonSlug: question.lessonSlug,
    difficulty: question.difficulty,
    type: question.type,
  };
}

function hasAnswer(question: PublicPracticeQuestion, answer: AnswerValue | undefined) {
  if (question.type === "multiple-select") return Array.isArray(answer) && answer.length > 0;
  return typeof answer === "string" && answer.trim().length > 0;
}

function displaySubmittedAnswer(question: PublicPracticeQuestion, answer: AnswerValue) {
  if (Array.isArray(answer)) {
    return answer
      .map((id) => question.options?.find((option) => option.id === id)?.text ?? id)
      .join(", ");
  }
  if (question.type === "multiple-choice") {
    return question.options?.find((option) => option.id === answer)?.text ?? answer;
  }
  return answer;
}

export function PracticeSession({
  courseTitle,
  initialQuestions,
  filters,
  initialSessionId,
  returnTo,
}: {
  courseTitle: string;
  initialQuestions: PublicPracticeQuestion[];
  filters: SessionFilters;
  initialSessionId?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>();
  const [questions, setQuestions] = useState(initialQuestions);
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [storageWarning, setStorageWarning] = useState(false);
  const [cloudWarning, setCloudWarning] = useState(false);
  const submittingRef = useRef(false);
  const submissionIdsRef = useRef<Record<string, string>>({});
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const existing = initialSessionId ? getPracticeSession(initialSessionId) : undefined;
      if (existing && existing.courseId === initialQuestions[0]?.courseId) {
        const byId = new Map(initialQuestions.map((question) => [question.id, question]));
        const restoredQuestions = existing.questionIds
          .map((id) => byId.get(id))
          .filter((question): question is PublicPracticeQuestion => Boolean(question));
        if (restoredQuestions.length === initialQuestions.length) {
          setQuestions(restoredQuestions);
          setAttempts(existing.attempts);
          setAnswers(Object.fromEntries(existing.attempts.map((attempt) => [attempt.question.id, attempt.submittedAnswer])));
          const firstUnanswered = restoredQuestions.findIndex(
            (question) => !existing.attempts.some((attempt) => attempt.question.id === question.id),
          );
          setCurrentIndex(firstUnanswered === -1 ? restoredQuestions.length - 1 : firstUnanswered);
          setSessionId(existing.id);
          setReady(true);
          return;
        }
      }

      try {
        const newSessionId = createSafeSessionId();
        const history = getAllStoredAttempts();
        const orderedIds = prioritizePublicQuestionIds(
          initialQuestions.map((question) => question.id),
          initialQuestions.map(questionToMeta),
          history,
        );
        const byId = new Map(initialQuestions.map((question) => [question.id, question]));
        const orderedQuestions = orderedIds
          .map((id) => byId.get(id))
          .filter((question): question is PublicPracticeQuestion => Boolean(question));
        const now = new Date().toISOString();
        const record: PracticeSessionRecord = {
          version: 1,
          id: newSessionId,
          courseId: initialQuestions[0].courseId,
          courseTitle,
          questionIds: orderedIds,
          filters,
          returnTo: sanitizeReturnPath(returnTo),
          attempts: [],
          startedAt: now,
          updatedAt: now,
        };
        if (!upsertPracticeSession(record)) setStorageWarning(true);
        setQuestions(orderedQuestions);
        setSessionId(newSessionId);
        const url = new URL(window.location.href);
        url.searchParams.set("session", newSessionId);
        window.history.replaceState(window.history.state, "", url);
      } catch {
        setError("This browser could not create a secure local practice session.");
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseTitle, filters, initialQuestions, initialSessionId, returnTo]);

  const currentQuestion = questions[currentIndex];
  const currentAttempt = attempts.find((attempt) => attempt.question.id === currentQuestion?.id);
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const completed = useMemo(
    () => isSessionComplete(questions.map((question) => question.id), attempts),
    [attempts, questions],
  );

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionId || !currentQuestion || currentAttempt || submittingRef.current) return;
    if (!hasAnswer(currentQuestion, currentAnswer)) {
      setError("Choose or enter an answer before submitting.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError(undefined);
    try {
      const submissionId = submissionIdsRef.current[currentQuestion.id]
        ?? createSafeSessionId();
      submissionIdsRef.current[currentQuestion.id] = submissionId;
      const response = await fetch("/api/practice/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: currentAnswer,
          sessionId,
          submissionId,
          courseId: currentQuestion.courseId,
          questionIds: questions.map((question) => question.id),
        }),
      });
      const data = (await response.json()) as EvaluationSuccess | EvaluationFailure | { error: string };
      if (!response.ok || !("valid" in data) || !data.valid) {
        const message = "error" in data ? data.error : "Your answer could not be checked.";
        setError(message);
        return;
      }

      const nextAttempt: StoredAttempt = {
        question: currentQuestion,
        submittedAnswer: currentAnswer as AnswerValue,
        result: data,
        submittedAt: new Date().toISOString(),
      };
      const nextAttempts = [...attempts, nextAttempt];
      const now = new Date().toISOString();
      const session: PracticeSessionRecord = {
        version: 1,
        id: sessionId,
        courseId: currentQuestion.courseId,
        courseTitle,
        questionIds: questions.map((question) => question.id),
        filters,
        returnTo: sanitizeReturnPath(returnTo),
        attempts: nextAttempts,
        startedAt: getPracticeSession(sessionId)?.startedAt ?? now,
        updatedAt: now,
        completedAt: isSessionComplete(questions.map((question) => question.id), nextAttempts)
          ? now
          : undefined,
      };
      if (!upsertPracticeSession(session)) setStorageWarning(true);
      if (data.persistence?.status === "failed") setCloudWarning(true);
      setAttempts(nextAttempts);
      window.setTimeout(() => feedbackRef.current?.focus(), 0);
    } catch {
      setError("OpenAP could not reach the answer checker. Check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function moveTo(index: number) {
    setCurrentIndex(index);
    setError(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => headingRef.current?.focus(), 0);
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 dark:bg-slate-950" data-practice-session id="main-content">
        <div className="text-center text-slate-600 dark:text-slate-300">
          <LoaderCircle aria-hidden="true" className="mx-auto size-7 animate-spin text-blue-600" />
          <p className="mt-4 font-semibold">Preparing your practice session…</p>
        </div>
      </main>
    );
  }

  if (!sessionId || !currentQuestion) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 dark:bg-slate-950" data-practice-session id="main-content">
        <div className="max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center dark:border-rose-900 dark:bg-slate-900">
          <CircleAlert aria-hidden="true" className="mx-auto size-8 text-rose-600" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Session unavailable</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{error ?? "No matching questions were found."}</p>
          <Link className="button-primary mt-6" href="/practice">Return to practice</Link>
        </div>
      </main>
    );
  }

  const progress = Math.round((attempts.length / questions.length) * 100);
  const exitHref = sanitizeReturnPath(returnTo) ?? "/practice";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950" data-practice-session id="main-content">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <Logo />
          <div className="min-w-0 flex-1 border-l border-slate-200 pl-5 dark:border-slate-700">
            <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{courseTitle}</p>
            <div className="mt-2 flex items-center gap-3">
              <div aria-label={`${attempts.length} of ${questions.length} questions answered`} aria-valuemax={questions.length} aria-valuemin={0} aria-valuenow={attempts.length} className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar">
                <div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{attempts.length}/{questions.length}</span>
            </div>
          </div>
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" href={exitHref}>
            <DoorOpen aria-hidden="true" className="size-4" />
            Exit session
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        {storageWarning ? (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200" role="status">
            Your browser blocked local history. You can keep practicing, but results may not be available after leaving this page.
          </div>
        ) : null}

        {cloudWarning ? (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200" role="status">
            Your answer was checked and kept in this browser, but it could not sync to your account. Your local result has not been discarded.
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Question {currentIndex + 1} of {questions.length}</span>
            <span className={`rounded-full px-3 py-1 capitalize ${difficultyStyles[currentQuestion.difficulty]}`}>{currentQuestion.difficulty}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{currentQuestion.topicLabel}</span>
          </div>

          <h1 className="mt-6 text-2xl font-bold leading-tight tracking-[-0.03em] text-slate-950 outline-none sm:text-3xl dark:text-white" ref={headingRef} tabIndex={-1}>{currentQuestion.content.prompt}</h1>
          {currentQuestion.content.formula ? <MathFormula latex={currentQuestion.content.formula} /> : null}
          {currentQuestion.content.code ? (
            <pre className="my-6 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-100" tabIndex={0}><code>{currentQuestion.content.code}</code></pre>
          ) : null}

          <form className="mt-7" onSubmit={submitAnswer}>
            {(currentQuestion.type === "multiple-choice" || currentQuestion.type === "multiple-select") ? (
              <fieldset>
                <legend className="mb-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {currentQuestion.type === "multiple-select" ? "Select all that apply." : "Choose one answer."}
                </legend>
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, optionIndex) => {
                    const selected = Array.isArray(currentAnswer)
                      ? currentAnswer.includes(option.id)
                      : currentAnswer === option.id;
                    return (
                      <label className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${selected ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-blue-800 dark:hover:bg-slate-800/60"} ${currentAttempt ? "cursor-default" : ""}`} key={option.id}>
                        <input
                          checked={selected}
                          className="mt-1 size-4 accent-blue-600"
                          disabled={Boolean(currentAttempt)}
                          name={currentQuestion.id}
                          onChange={() => {
                            setError(undefined);
                            if (currentQuestion.type === "multiple-select") {
                              const existing = Array.isArray(currentAnswer) ? currentAnswer : [];
                              setAnswers((all) => ({
                                ...all,
                                [currentQuestion.id]: selected
                                  ? existing.filter((id) => id !== option.id)
                                  : [...existing, option.id],
                              }));
                            } else {
                              setAnswers((all) => ({ ...all, [currentQuestion.id]: option.id }));
                            }
                          }}
                          type={currentQuestion.type === "multiple-select" ? "checkbox" : "radio"}
                          value={option.id}
                        />
                        <span className="flex gap-3 text-sm leading-6 text-slate-800 dark:text-slate-200">
                          <span className="font-bold text-slate-400">{String.fromCharCode(65 + optionIndex)}.</span>
                          {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {currentQuestion.type === "numerical" ? (
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Numerical answer
                <input
                  autoComplete="off"
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-800"
                  disabled={Boolean(currentAttempt)}
                  inputMode="decimal"
                  onChange={(event) => {
                    setError(undefined);
                    setAnswers((all) => ({ ...all, [currentQuestion.id]: event.target.value }));
                  }}
                  placeholder="Enter a number"
                  type="text"
                  value={typeof currentAnswer === "string" ? currentAnswer : ""}
                />
              </label>
            ) : null}

            {currentQuestion.type === "short-answer" ? (
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Short answer
                <input
                  autoComplete="off"
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-800"
                  disabled={Boolean(currentAttempt)}
                  onChange={(event) => {
                    setError(undefined);
                    setAnswers((all) => ({ ...all, [currentQuestion.id]: event.target.value }));
                  }}
                  placeholder="Enter a brief, exact response"
                  type="text"
                  value={typeof currentAnswer === "string" ? currentAnswer : ""}
                />
                <span className="mt-2 block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">Graded only against explicitly configured exact alternatives—not open-ended meaning.</span>
              </label>
            ) : null}

            {error ? <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300" role="alert"><CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{error}</p> : null}

            {!currentAttempt ? (
              <button className="button-primary mt-6 min-h-12 justify-center disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:translate-y-0" disabled={!hasAnswer(currentQuestion, currentAnswer) || submitting} type="submit">
                {submitting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
                {submitting ? "Checking…" : "Submit answer"}
              </button>
            ) : null}
          </form>

          {currentAttempt ? (
            <div className={`mt-7 rounded-2xl border p-5 outline-none sm:p-6 ${currentAttempt.result.correct ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30" : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"}`} ref={feedbackRef} role="status" tabIndex={-1}>
              <div className="flex items-center gap-3">
                <span className={`grid size-9 place-items-center rounded-full ${currentAttempt.result.correct ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}`}>
                  {currentAttempt.result.correct ? <Check aria-hidden="true" className="size-5" /> : <CircleAlert aria-hidden="true" className="size-5" />}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">{currentAttempt.result.correct ? "Correct!" : "Not quite yet"}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Your answer: {displaySubmittedAnswer(currentQuestion, currentAttempt.submittedAnswer)}</p>
                </div>
              </div>
              {!currentAttempt.result.correct ? (
                <p className="mt-5 rounded-xl bg-white/70 p-4 text-sm text-slate-700 dark:bg-slate-900/60 dark:text-slate-200"><strong>Correct answer:</strong> {currentAttempt.result.correctAnswer}</p>
              ) : null}
              <div className="mt-5 border-t border-current/10 pt-5">
                <h3 className="font-bold text-slate-950 dark:text-white">Explanation</h3>
                <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{currentAttempt.result.explanation}</p>
                {currentAttempt.result.explanationFormula ? <MathFormula latex={currentAttempt.result.explanationFormula} /> : null}
                {currentAttempt.result.optionExplanations ? (
                  <ul className="mt-4 space-y-2">
                    {currentQuestion.options?.map((option, index) => (
                      <li className="text-sm leading-6 text-slate-700 dark:text-slate-300" key={option.id}><strong>{String.fromCharCode(65 + index)}.</strong> {currentAttempt.result.optionExplanations?.[option.id]}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}

          <nav aria-label="Practice question navigation" className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <button className="button-secondary min-h-11 justify-center disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0" disabled={currentIndex === 0} onClick={() => moveTo(currentIndex - 1)} type="button">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button className="button-primary min-h-11 justify-center disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:translate-y-0" disabled={!currentAttempt} onClick={() => moveTo(currentIndex + 1)} type="button">
                Next question
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            ) : completed ? (
              <button className="button-primary min-h-11 justify-center" onClick={() => router.push(`/practice/results/${sessionId}`)} type="button">
                View results
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            ) : (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Submit this answer to complete the session.</span>
            )}
          </nav>
        </section>
      </div>
    </main>
  );
}
