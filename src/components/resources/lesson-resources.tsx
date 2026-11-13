"use client";

import { PlaySquare } from "lucide-react";
import { useMemo } from "react";

import type { CourseNamesById } from "@/resources/selectors";
import type { LearningResource } from "@/resources/types";
import { useResourceBookmarks } from "@/resources/use-bookmarks";

import { ResourceCard } from "./resource-card";

export function LessonResources({
  resources,
  courseNames,
  authenticated = false,
}: {
  resources: LearningResource[];
  courseNames: CourseNamesById;
  authenticated?: boolean;
}) {
  const resourceIds = useMemo(() => resources.map((resource) => resource.id), [resources]);
  const { savedIds, toggle, syncError } = useResourceBookmarks(resourceIds, authenticated);
  if (resources.length === 0) return null;

  return (
    <section aria-labelledby="recommended-video-lessons" className="my-10 border-y border-slate-200 py-10 dark:border-slate-800">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
        <PlaySquare aria-hidden="true" className="size-4" />
        Watch and reinforce
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white" id="recommended-video-lessons">Recommended Video Lessons</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">These verified videos are explicitly mapped to this lesson. Playback stays off until you choose to start it.</p>
      {syncError ? <p className="mt-3 text-sm text-amber-700 dark:text-amber-300" role="status">{syncError}</p> : null}
      <div className="mt-6 grid gap-5">
        {resources.map((resource) => (
          <ResourceCard
            courseNames={courseNames}
            key={resource.id}
            onToggleSaved={toggle}
            resource={resource}
            saved={savedIds.has(resource.id)}
          />
        ))}
      </div>
    </section>
  );
}
