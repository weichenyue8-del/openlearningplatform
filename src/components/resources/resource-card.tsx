import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  ShieldCheck,
  Video,
} from "lucide-react";

import type { CourseNamesById } from "@/resources/selectors";
import {
  resourceAccessLabels,
  resourceTypeLabels,
  type LearningResource,
} from "@/resources/types";

import { VideoPlayer } from "./video-player";

type ResourceCardProps = {
  resource: LearningResource;
  courseNames: CourseNamesById;
  saved: boolean;
  onToggleSaved: (resourceId: string) => void;
  recommendationReason?: string;
};

function ResourceTypeIcon({ resource }: { resource: LearningResource }) {
  const className = "size-3.5";
  if (resource.type === "youtube-video") return <Video aria-hidden="true" className={className} />;
  if (resource.type === "online-course") return <GraduationCap aria-hidden="true" className={className} />;
  if (resource.type === "textbook") return <BookOpen aria-hidden="true" className={className} />;
  if (resource.type === "github-repository") return <Code2 aria-hidden="true" className={className} />;
  return <FileText aria-hidden="true" className={className} />;
}

export function ResourceCard({
  resource,
  courseNames,
  saved,
  onToggleSaved,
  recommendationReason,
}: ResourceCardProps) {
  const relatedCourses = resource.courseIds
    .map((courseId) => courseNames[courseId])
    .filter(Boolean);
  const openLabel = resource.type === "youtube-video" ? "Open on YouTube" : "Open resource";

  return (
    <article className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
      {resource.type === "youtube-video" ? (
        <VideoPlayer relatedCourse={relatedCourses[0]} resource={resource} />
      ) : (
        <div className="flex aspect-[16/7] items-end overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-5 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950">
          <div className="grid size-11 place-items-center rounded-2xl bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300">
            <ResourceTypeIcon resource={resource} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <ResourceTypeIcon resource={resource} />
            {resourceTypeLabels[resource.type]}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {resource.difficulty}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            {resource.subject}
          </span>
        </div>

        {recommendationReason ? (
          <p className="mt-4 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold leading-5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
            {recommendationReason}
          </p>
        ) : null}

        <h3 className="mt-4 text-lg font-bold leading-6 tracking-[-0.02em] text-slate-950 dark:text-white">
          {resource.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {resource.creator ? `${resource.creator} · ` : ""}{resource.provider}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {resource.description}
        </p>

        {relatedCourses.length > 0 || resource.topicLabels.length > 0 ? (
          <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            {relatedCourses.length > 0 ? (
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-slate-500 dark:text-slate-400">Course</dt>
                <dd className="text-slate-700 dark:text-slate-300">{relatedCourses.join(", ")}</dd>
              </div>
            ) : null}
            {resource.topicLabels.length > 0 ? (
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-slate-500 dark:text-slate-400">Topic</dt>
                <dd className="line-clamp-2 text-slate-700 dark:text-slate-300">{resource.topicLabels.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-950/70 dark:text-slate-300">
          <p className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-emerald-600" />
            {resourceAccessLabels[resource.access]}
          </p>
          {resource.license ? (
            <p className="mt-1">
              License: {resource.license}
              {resource.licenseUrl ? (
                <> · <a className="font-semibold text-blue-600 hover:underline dark:text-blue-400" href={resource.licenseUrl} rel="noopener noreferrer" target="_blank">terms</a></>
              ) : null}
            </p>
          ) : (
            <p className="mt-1">No reuse license is claimed; use the original source.</p>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <a
            className="button-primary min-w-0 flex-1 justify-center !px-3 !py-2.5"
            href={resource.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="truncate">{openLabel}</span>
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          </a>
          <button
            aria-label={saved ? `Remove ${resource.title} from saved resources` : `Save ${resource.title}`}
            aria-pressed={saved}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950"
            onClick={() => onToggleSaved(resource.id)}
            type="button"
          >
            {saved ? <BookmarkCheck aria-hidden="true" className="size-4" /> : <Bookmark aria-hidden="true" className="size-4" />}
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-4 text-slate-400">{resource.attribution}</p>
      </div>
    </article>
  );
}
