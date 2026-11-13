"use client";

import {
  ArrowRight,
  Atom,
  BookText,
  Brain,
  Calculator,
  ChartBar,
  Code2,
  Landmark,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { recommendQuestions } from "@/practice/recommendation";
import { getAllStoredAttempts } from "@/practice/storage";
import type {
  Difficulty,
  PracticeCourseSummary,
  PracticeQuestionMeta,
  StoredAttempt,
} from "@/practice/types";

const iconMap = {
  calculus: Calculator,
  statistics: ChartBar,
  code: Code2,
  economics: Landmark,
  physics: Atom,
  psychology: Brain,
  english: BookText,
} as const;

const colorMap: Record<string, string> = {
  calculus: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  statistics: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  code: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  economics: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  physics: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  psychology: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  english: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const difficultyStyles: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  hard: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

function uniqueById<T extends { id: string; label: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function buildPracticeHref(courseId: string, unitId: string, topicId: string, difficulty: string) {
  const query = new URLSearchParams();
  if (unitId !== "all") query.set("unit", unitId);
  if (topicId !== "all") query.set("topic", topicId);
  if (difficulty !== "all") query.set("difficulty", difficulty);
  const suffix = query.toString();
  return `/practice/${courseId}${suffix ? `?${suffix}` : ""}`;
}

export function PracticeDashboard({
  courses,
  questionMeta,
}: {
  courses: PracticeCourseSummary[];
  questionMeta: PracticeQuestionMeta[];
}) {
  const [courseId, setCourseId] = useState("all");
  const [unitId, setUnitId] = useState("all");
  const [topicId, setTopicId] = useState("all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAttempts(getAllStoredAttempts()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const units = useMemo(() => {
    if (courseId === "all") return [];
    return uniqueById(
      questionMeta
        .filter((question) => question.courseId === courseId)
        .map((question) => ({ id: question.unitId, label: question.unitLabel })),
    );
  }, [courseId, questionMeta]);

  const topics = useMemo(() => {
    if (courseId === "all") return [];
    return uniqueById(
      questionMeta
        .filter(
          (question) =>
            question.courseId === courseId &&
            (unitId === "all" || question.unitId === unitId),
        )
        .map((question) => ({ id: question.topicId, label: question.topicLabel })),
    );
  }, [courseId, questionMeta, unitId]);

  const filterForCourse = (candidateCourseId: string) =>
    questionMeta.filter(
      (question) =>
        question.courseId === candidateCourseId &&
        (unitId === "all" || question.unitId === unitId) &&
        (topicId === "all" || question.topicId === topicId) &&
        (difficulty === "all" || question.difficulty === difficulty),
    );

  const visibleCourses = courseId === "all" ? courses : courses.filter((course) => course.id === courseId);
  const totalMatches = visibleCourses.reduce(
    (total, course) => total + filterForCourse(course.id).length,
    0,
  );

  const recommendation = attempts.length > 0
    ? recommendQuestions(questionMeta, attempts)[0]
    : undefined;
  const recommendedCourse = recommendation
    ? courses.find((course) => course.id === recommendation.question.courseId)
    : undefined;

  function resetFilters() {
    setCourseId("all");
    setUnitId("all");
    setTopicId("all");
    setDifficulty("all");
  }

  return (
    <main className="bg-slate-50 dark:bg-slate-950" id="main-content">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950 sm:py-20">
        <div className="hero-grid absolute inset-0 opacity-50 dark:opacity-15" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Sparkles aria-hidden="true" className="size-3.5" />
            40 original practice questions
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-6xl dark:text-white">
            Practice Makes Progress.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Strengthen your understanding with interactive questions, instant feedback, and personalized practice.
          </p>
          <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
            OpenAP questions are original, unofficial educational material and are not endorsed by the College Board.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        {recommendation && recommendedCourse ? (
          <aside className="mb-8 grid gap-5 rounded-3xl border border-blue-200 bg-blue-50/70 p-6 dark:border-blue-900 dark:bg-blue-950/30 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Recommended next</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{recommendation.question.topicLabel}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{recommendation.reason}. This is a simple study suggestion based only on your recent local practice—not a mastery score.</p>
            </div>
            <Link
              className="button-primary justify-center"
              href={`/practice/${recommendation.question.courseId}?topic=${encodeURIComponent(recommendation.question.topicId)}`}
            >
              Practice {recommendedCourse.shortTitle}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </aside>
        ) : null}

        <section aria-labelledby="practice-filters" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Session builder</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white" id="practice-filters">Choose what to practice</h2>
            </div>
            <button className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300" onClick={resetFilters} type="button">
              <RotateCcw aria-hidden="true" className="size-4" />
              Reset filters
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Course
              <select
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                onChange={(event) => {
                  setCourseId(event.target.value);
                  setUnitId("all");
                  setTopicId("all");
                }}
                value={courseId}
              >
                <option value="all">All courses</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Unit
              <select
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                disabled={courseId === "all" || units.length === 0}
                onChange={(event) => {
                  setUnitId(event.target.value);
                  setTopicId("all");
                }}
                value={unitId}
              >
                <option value="all">All units</option>
                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Topic
              <select
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                disabled={courseId === "all" || topics.length === 0}
                onChange={(event) => setTopicId(event.target.value)}
                value={topicId}
              >
                <option value="all">All topics</option>
                {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Difficulty
              <select
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                onChange={(event) => setDifficulty(event.target.value as "all" | Difficulty)}
                value={difficulty}
              >
                <option value="all">All difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>
          <p aria-live="polite" className="mt-5 text-sm text-slate-500 dark:text-slate-400">
            {totalMatches} {totalMatches === 1 ? "question matches" : "questions match"} these filters.
          </p>
        </section>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Practice courses</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">Pick a course and begin.</h2>
          </div>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">{visibleCourses.length} of {courses.length} courses shown</p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => {
            const Icon = iconMap[course.icon as keyof typeof iconMap] ?? BookText;
            const matches = filterForCourse(course.id);
            const hasAnyQuestions = course.questionCount > 0;
            const filteredOut = hasAnyQuestions && matches.length === 0;
            const cardDifficulties = [...new Set(questionMeta.filter((question) => question.courseId === course.id).map((question) => question.difficulty))];
            return (
              <article className="flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20" key={course.id}>
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid size-11 place-items-center rounded-xl ${colorMap[course.icon] ?? colorMap.english}`}>
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${hasAnyQuestions ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                    {hasAnyQuestions ? `${course.questionCount} questions` : "Coming Soon"}
                  </span>
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.13em] text-blue-600 dark:text-blue-400">{course.category}</p>
                <h3 className="mt-2 text-xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white">{course.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{course.description}</p>
                {cardDifficulties.length > 0 ? (
                  <div aria-label="Available difficulties" className="mt-5 flex flex-wrap gap-2">
                    {cardDifficulties.map((level) => <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${difficultyStyles[level]}`} key={level}>{level}</span>)}
                  </div>
                ) : null}
                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  {hasAnyQuestions && !filteredOut ? (
                    <Link className="button-primary w-full justify-center" href={buildPracticeHref(course.id, unitId, topicId, difficulty)}>
                      Start Practicing · {matches.length}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  ) : (
                    <span className="flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {filteredOut ? "No questions match" : "Questions in review"}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
