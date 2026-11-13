"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  AccuracyPoint,
  CourseProgressPoint,
  MasteryPoint,
  PerformancePoint,
} from "@/lib/learning/types";

function EmptyChart({ children }: { children: React.ReactNode }) {
  return <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">{children}</div>;
}

export function DashboardCharts({
  accuracy,
  courseProgress,
  subjectPerformance,
  topicMastery,
}: {
  accuracy: AccuracyPoint[];
  courseProgress: CourseProgressPoint[];
  subjectPerformance: PerformancePoint[];
  topicMastery: MasteryPoint[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard eyebrow="Observed results" title="Practice accuracy over time">
        {accuracy.length ? (
          <><div className="h-64" aria-hidden="true">
            <ResponsiveContainer height="100%" width="100%"><LineChart data={accuracy} margin={{ left: -18, right: 12, top: 10, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" fontSize={11} /><YAxis domain={[0, 100]} fontSize={11} tickFormatter={(value) => `${value}%`} /><Tooltip formatter={(value) => [`${value}%`, "Observed accuracy"]} /><Line dataKey="accuracy" stroke="#2563eb" strokeWidth={3} type="monotone" /></LineChart></ResponsiveContainer>
          </div><table className="sr-only"><caption>Practice accuracy by completed session</caption><thead><tr><th>Date</th><th>Correct</th><th>Total</th><th>Accuracy</th></tr></thead><tbody>{accuracy.map((point) => <tr key={point.id}><td>{point.label}</td><td>{point.correct}</td><td>{point.total}</td><td>{point.accuracy}%</td></tr>)}</tbody></table></>
        ) : <EmptyChart>Complete a signed-in practice session to see observed accuracy here.</EmptyChart>}
      </ChartCard>

      <ChartCard eyebrow="Course progress" title="Published lessons completed">
        {courseProgress.length ? (
          <><div className="h-64" aria-hidden="true"><ResponsiveContainer height="100%" width="100%"><BarChart data={courseProgress} layout="vertical" margin={{ left: 24, right: 16, top: 8, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis domain={[0, 100]} type="number" tickFormatter={(value) => `${value}%`} fontSize={11} /><YAxis dataKey="label" type="category" width={90} fontSize={11} /><Tooltip formatter={(value) => [`${value}%`, "Completion"]} /><Bar dataKey="progress" fill="#0ea5e9" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div><table className="sr-only"><caption>Course lesson progress</caption><thead><tr><th>Course</th><th>Completed</th><th>Total</th><th>Progress</th></tr></thead><tbody>{courseProgress.map((point) => <tr key={point.courseId}><td>{point.label}</td><td>{point.completed}</td><td>{point.total}</td><td>{point.progress}%</td></tr>)}</tbody></table></>
        ) : <EmptyChart>Add a course with published lessons to begin tracking completion.</EmptyChart>}
      </ChartCard>

      <ChartCard eyebrow="Observed results" title="Accuracy by subject">
        {subjectPerformance.length ? (
          <><div className="h-64" aria-hidden="true"><ResponsiveContainer height="100%" width="100%"><BarChart data={subjectPerformance} margin={{ left: -18, right: 12, top: 8, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" fontSize={10} interval={0} angle={-15} textAnchor="end" /><YAxis domain={[0, 100]} fontSize={11} tickFormatter={(value) => `${value}%`} /><Tooltip formatter={(value) => [`${value}%`, "Observed accuracy"]} /><Bar dataKey="accuracy" fill="#7c3aed" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div><table className="sr-only"><caption>Observed accuracy by subject</caption><thead><tr><th>Subject</th><th>Correct</th><th>Attempts</th><th>Accuracy</th></tr></thead><tbody>{subjectPerformance.map((point) => <tr key={point.id}><td>{point.label}</td><td>{point.correct}</td><td>{point.attempts}</td><td>{point.accuracy}%</td></tr>)}</tbody></table></>
        ) : <EmptyChart>Answer questions in more than one subject to compare observed performance.</EmptyChart>}
      </ChartCard>

      <ChartCard eyebrow="Confidence-adjusted estimate" title="Topics to strengthen">
        {topicMastery.length ? (
          <div>
            <div className="space-y-4">
              {topicMastery.slice(0, 6).map((topic) => <div key={topic.id}><div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-800 dark:text-slate-200">{topic.label}</span><span className="text-slate-500 dark:text-slate-400">{topic.estimatedMastery}% estimate · {topic.accuracy}% observed</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-amber-500" style={{ width: `${topic.estimatedMastery}%` }} /></div></div>)}
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Estimated mastery uses a simple confidence adjustment and appears only after at least two attempts. It is a study signal, not a validated assessment.</p>
          </div>
        ) : <EmptyChart>At least two attempts in a topic are required before OpenAP shows a mastery estimate.</EmptyChart>}
      </ChartCard>
    </div>
  );
}

function ChartCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">{eyebrow}</p><h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{title}</h2><div className="mt-6">{children}</div></section>;
}
