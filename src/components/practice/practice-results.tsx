"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  CircleAlert,
  RefreshCw,
  RotateCcw,
  Target,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MathFormula } from "@/components/lesson/math-formula";
import {
  calculateAccuracy,
  calculateDifficultyPerformance,
  calculateTopicPerformance,
} from "@/practice/analytics";
import { recommendQuestions } from "@/practice/recommendation";
import { getAllStoredAttempts, getPracticeSession } from "@/practice/storage";
import type {
  PracticeQuestionMeta,
  PracticeSession,
  PublicPracticeQuestion,
  StoredAttempt,
} from "@/practice/types";

function formatAnswer(question: PublicPracticeQuestion, answer: string | string[]) {
  if (Array.isArray(answer)) {
    return answer.map((id) => question.options?.find((option) => option.id === id)?.text ?? id).join(", ");
  }
  if (question.type === "multiple-choice") {
    return question.options?.find((option) => option.id === answer)?.text ?? answer;
  }
  return answer;
}

function buildPracticeAgainHref(session: PracticeSession) {
  const query = new URLSearchParams();
  if (session.filters.unitId) query.set("unit", session.filters.unitId);
  if (session.filters.topicId) query.set("topic", session.filters.topicId);
  if (session.filters.difficulty) query.set("difficulty", session.filters.difficulty);
  if (session.returnTo) query.set("returnTo", session.returnTo);
  return `/practice/${session.courseId}${query.size ? `?${query}` : ""}`;
}

export function PracticeResults({
  sessionId,
  questionMeta,
}: {
  sessionId: string;
  questionMeta: PracticeQuestionMeta[];
}) {
  const [session, setSession] = useState<PracticeSession>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(getPracticeSession(sessionId));
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  const attempts = useMemo(() => session?.attempts ?? [], [session]);
  const summary = useMemo(() => calculateAccuracy(attempts), [attempts]);
  const topicPerformance = useMemo(() => calculateTopicPerformance(attempts), [attempts]);
  const difficultyPerformance = useMemo(() => calculateDifficultyPerformance(attempts), [attempts]);
  const mistakes = attempts.filter((attempt) => !attempt.result.correct);
  const recommendation = session
    ? recommendQuestions(questionMeta, getAllStoredAttempts())[0]
    : undefined;

  if (!loaded) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-5 dark:bg-slate-950" id="main-content">
        <p className="flex items-center gap-3 font-semibold text-slate-600 dark:text-slate-300"><RefreshCw aria-hidden="true" className="size-5 animate-spin text-blue-600" />Loading your local results…</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-5 py-16 dark:bg-slate-950" id="main-content">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <CircleAlert aria-hidden="true" className="mx-auto size-10 text-amber-600" />
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">Results not found</h1>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">This session is not stored in this browser. Local practice history can be cleared, blocked, or unavailable on another device.</p>
          <Link className="button-primary mt-7" href="/practice"><ArrowLeft aria-hidden="true" className="size-4" />Return to practice</Link>
        </section>
      </main>
    );
  }

  const retryQuery = new URLSearchParams({ ids: mistakes.map((attempt) => attempt.question.id).join(",") });
  if (session.returnTo) retryQuery.set("returnTo", session.returnTo);

  return (
    <main className="bg-slate-50 py-10 dark:bg-slate-950 sm:py-14" id="main-content">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-xl shadow-slate-900/5 dark:border-blue-900 dark:bg-slate-900 dark:shadow-black/20">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-9 text-white sm:px-10 sm:py-12">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/15"><Trophy aria-hidden="true" className="size-6" /></span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-blue-100">{session.courseTitle}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Practice Completed!</h1>
            <p className="mt-4 max-w-2xl leading-7 text-blue-100">These results come only from the answers submitted in this session.</p>
          </div>

          <div className="grid gap-px bg-slate-200 dark:bg-slate-800 sm:grid-cols-4">
            {[
              { label: "Questions answered", value: summary.total, icon: Target },
              { label: "Correct answers", value: summary.correct, icon: Check },
              { label: "Incorrect answers", value: summary.incorrect, icon: X },
              { label: "Accuracy", value: `${summary.accuracy}%`, icon: Trophy },
            ].map(({ label, value, icon: Icon }) => (
              <div className="bg-white p-6 dark:bg-slate-900" key={label}>
                <Icon aria-hidden="true" className="size-5 text-blue-600 dark:text-blue-400" />
                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7" aria-labelledby="topic-performance">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Performance chart</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white" id="topic-performance">Accuracy by topic</h2>
            </div>
            <div aria-hidden="true" className="mt-6 h-72 w-full">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={topicPerformance} margin={{ bottom: 16, left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="topicLabel" fontSize={11} interval={0} tickFormatter={(value) => String(value).slice(0, 13)} />
                  <YAxis domain={[0, 100]} fontSize={11} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "Accuracy"]} />
                  <Bar dataKey="accuracy" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Accessible topic performance data</caption>
                <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"><tr><th className="py-2 pr-4">Topic</th><th className="px-4 py-2">Correct</th><th className="px-4 py-2">Attempts</th><th className="py-2 pl-4">Accuracy</th></tr></thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {topicPerformance.map((topic) => <tr key={`${topic.topicId}-${topic.topicLabel}`}><th className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">{topic.topicLabel}</th><td className="px-4 py-3 text-slate-600 dark:text-slate-300">{topic.correct}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-300">{topic.attempts}</td><td className="py-3 pl-4 font-bold text-slate-950 dark:text-white">{topic.accuracy}%</td></tr>)}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7" aria-labelledby="difficulty-breakdown">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Breakdown</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white" id="difficulty-breakdown">By difficulty</h2>
            <div className="mt-6 space-y-5">
              {difficultyPerformance.map((item) => (
                <div key={item.difficulty}>
                  <div className="flex items-center justify-between text-sm"><span className="font-semibold capitalize text-slate-700 dark:text-slate-200">{item.difficulty}</span><span className="text-slate-500 dark:text-slate-400">{item.correct}/{item.attempts} · {item.accuracy}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-blue-600" style={{ width: `${item.accuracy}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-7 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-950 dark:text-slate-400">Practice history is stored only in this browser. It does not sync across devices or accounts.</p>
          </section>
        </div>

        {recommendation ? (
          <aside className="mt-6 grid gap-5 rounded-3xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-900 dark:bg-violet-950/30 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">Suggested next step</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{recommendation.question.topicLabel}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{recommendation.reason}. The ranking uses recent correctness, attempt count, prior misses, and difficulty; it is not a validated mastery measure.</p>
            </div>
            <Link className="button-primary justify-center" href={`/practice/${recommendation.question.courseId}?topic=${encodeURIComponent(recommendation.question.topicId)}`}>Practice recommendation<ArrowRight aria-hidden="true" className="size-4" /></Link>
          </aside>
        ) : null}

        <section className="mt-8" aria-labelledby="review-mistakes">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Review</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white" id="review-mistakes">Review Mistakes</h2>
            </div>
            {mistakes.length > 0 ? <Link className="button-secondary justify-center" href={`/practice/${session.courseId}?${retryQuery}`}><RotateCcw aria-hidden="true" className="size-4" />Retry incorrect · {mistakes.length}</Link> : null}
          </div>

          {mistakes.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
              <Trophy aria-hidden="true" className="mx-auto size-9 text-emerald-600" />
              <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">No mistakes to review</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Every submitted answer in this session was correct.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {mistakes.map((attempt, index) => <MistakeCard attempt={attempt} index={index} key={attempt.question.id} />)}
            </div>
          )}
        </section>

        <nav aria-label="Results actions" className="mt-10 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
          <Link className="button-primary justify-center" href={buildPracticeAgainHref(session)}><RefreshCw aria-hidden="true" className="size-4" />Practice Again</Link>
          {session.returnTo ? <Link className="button-secondary justify-center" href={session.returnTo}><BookOpenText aria-hidden="true" className="size-4" />Return to Lesson</Link> : null}
          <Link className="button-secondary justify-center" href="/practice"><Target aria-hidden="true" className="size-4" />Practice Courses</Link>
          <Link className="button-secondary justify-center" href="/courses"><ArrowLeft aria-hidden="true" className="size-4" />Course Library</Link>
        </nav>
      </div>
    </main>
  );
}

function MistakeCard({ attempt, index }: { attempt: StoredAttempt; index: number }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <div><span className="text-xs font-bold uppercase tracking-[0.12em] text-rose-600 dark:text-rose-400">Mistake {index + 1} · {attempt.question.topicLabel}</span><h3 className="mt-1 font-bold text-slate-950 dark:text-white">{attempt.question.content.prompt}</h3></div>
        <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
      </summary>
      <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
        {attempt.question.content.formula ? <MathFormula latex={attempt.question.content.formula} /> : null}
        {attempt.question.content.code ? <pre className="my-5 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100"><code>{attempt.question.content.code}</code></pre> : null}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-rose-50 p-4 dark:bg-rose-950/30"><dt className="font-bold text-rose-800 dark:text-rose-300">Your answer</dt><dd className="mt-1 text-slate-700 dark:text-slate-200">{formatAnswer(attempt.question, attempt.submittedAnswer)}</dd></div>
          <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30"><dt className="font-bold text-emerald-800 dark:text-emerald-300">Correct answer</dt><dd className="mt-1 text-slate-700 dark:text-slate-200">{attempt.result.correctAnswer}</dd></div>
        </dl>
        <h4 className="mt-5 font-bold text-slate-950 dark:text-white">Explanation</h4>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{attempt.result.explanation}</p>
        {attempt.result.explanationFormula ? <MathFormula latex={attempt.result.explanationFormula} /> : null}
      </div>
    </details>
  );
}
