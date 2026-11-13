"use client";

import { Bookmark, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getAllStoredAttempts } from "@/practice/storage";
import { recommendResources } from "@/resources/recommendation";
import {
  filterAndSortResources,
  getFeaturedResources,
  getOpenResources,
  type CourseNamesById,
} from "@/resources/selectors";
import {
  resourceDifficulties,
  resourceSubjects,
  resourceTypeLabels,
  resourceTypes,
  type LearningResource,
  type ResourceDifficulty,
  type ResourceFilters,
  type ResourceSubject,
  type ResourceType,
} from "@/resources/types";
import { useResourceBookmarks } from "@/resources/use-bookmarks";

import { ResourceCard } from "./resource-card";

type ResourceExplorerProps = {
  resources: LearningResource[];
  courseNames: CourseNamesById;
  authenticated?: boolean;
};

const initialFilters: ResourceFilters = {
  query: "",
  type: "all",
  subject: "all",
  difficulty: "all",
  sort: "most-relevant",
  savedOnly: false,
};

function ResourceGrid({
  resources,
  courseNames,
  savedIds,
  onToggleSaved,
  recommendationReasons,
}: {
  resources: LearningResource[];
  courseNames: CourseNamesById;
  savedIds: ReadonlySet<string>;
  onToggleSaved: (resourceId: string) => void;
  recommendationReasons?: Map<string, string>;
}) {
  return (
    <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard
          courseNames={courseNames}
          key={resource.id}
          onToggleSaved={onToggleSaved}
          recommendationReason={recommendationReasons?.get(resource.id)}
          resource={resource}
          saved={savedIds.has(resource.id)}
        />
      ))}
    </div>
  );
}

export function ResourceExplorer({ resources, courseNames, authenticated = false }: ResourceExplorerProps) {
  const [filters, setFilters] = useState<ResourceFilters>(initialFilters);
  const [attempts, setAttempts] = useState<ReturnType<typeof getAllStoredAttempts>>([]);
  const resourceIds = useMemo(() => resources.map((resource) => resource.id), [resources]);
  const { savedIds, toggle, cloudReady, syncError } = useResourceBookmarks(resourceIds, authenticated);

  useEffect(() => {
    const timer = window.setTimeout(() => setAttempts(getAllStoredAttempts()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const featured = useMemo(() => getFeaturedResources(resources), [resources]);
  const openResources = useMemo(() => getOpenResources(resources), [resources]);
  const recommendations = useMemo(
    () => recommendResources(resources, attempts).slice(0, 3),
    [attempts, resources],
  );
  const recommendationReasons = useMemo(
    () => new Map(recommendations.map((item) => [item.resource.id, item.reason])),
    [recommendations],
  );
  const results = useMemo(
    () => filterAndSortResources(resources, filters, courseNames, savedIds),
    [courseNames, filters, resources, savedIds],
  );
  const filtersActive = Boolean(
    filters.query ||
    filters.type !== "all" ||
    filters.subject !== "all" ||
    filters.difficulty !== "all" ||
    filters.savedOnly,
  );

  function updateFilters(patch: Partial<ResourceFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  return (
    <div>
      <section aria-labelledby="find-resources" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Search and filter
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white" id="find-resources">Find the right next resource</h2>
          </div>
          <div className="sm:text-right">
            <button
              aria-pressed={filters.savedOnly}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${filters.savedOnly ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950"}`}
              onClick={() => updateFilters({ savedOnly: !filters.savedOnly })}
              type="button"
            >
              <Bookmark aria-hidden="true" className="size-4" />
              Saved resources ({savedIds.size})
            </button>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {authenticated ? cloudReady ? "Synced with your OpenAP account." : "Loading account bookmarks…" : "Saved only in this browser."}
            </p>
          </div>
        </div>

        {syncError ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="status">{syncError}</p> : null}

        <label className="relative mt-6 block">
          <span className="sr-only">Search resources</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-base text-slate-950 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-950"
            onChange={(event) => updateFilters({ query: event.target.value })}
            placeholder="Search by title, course, topic, creator, or provider…"
            type="search"
            value={filters.query}
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Subject</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", ...resourceSubjects] as const).map((subject) => (
              <button
                aria-pressed={filters.subject === subject}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${filters.subject === subject ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-950 dark:hover:text-blue-300"}`}
                key={subject}
                onClick={() => updateFilters({ subject: subject as ResourceSubject | "all" })}
                type="button"
              >
                {subject === "all" ? "All subjects" : subject}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
            Resource type
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              onChange={(event) => updateFilters({ type: event.target.value as ResourceType | "all" })}
              value={filters.type}
            >
              <option value="all">All types</option>
              {resourceTypes.map((type) => <option key={type} value={type}>{resourceTypeLabels[type]}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
            Difficulty
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold capitalize normal-case tracking-normal text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              onChange={(event) => updateFilters({ difficulty: event.target.value as ResourceDifficulty | "all" })}
              value={filters.difficulty}
            >
              <option value="all">All levels</option>
              {resourceDifficulties.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
            Sort
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              onChange={(event) => updateFilters({ sort: event.target.value as ResourceFilters["sort"] })}
              value={filters.sort}
            >
              <option value="most-relevant">Most Relevant</option>
              <option value="recently-added">Recently Added</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </label>
        </div>
      </section>

      {!filtersActive ? (
        <>
          <section aria-labelledby="featured-resources" className="mt-16">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Editor picks</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white" id="featured-resources">Featured learning resources</h2>
            <ResourceGrid courseNames={courseNames} onToggleSaved={toggle} resources={featured} savedIds={savedIds} />
          </section>

          <section aria-labelledby="recommended-resources" className="mt-16 rounded-[2rem] bg-slate-950 px-5 py-8 text-white dark:bg-slate-900 sm:px-8">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-300">
              <Sparkles aria-hidden="true" className="size-4" />
              Local, transparent recommendations
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]" id="recommended-resources">Recommended for you</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {attempts.length > 0
                ? "Ranked from your recent practice topics and accuracy. Your results stay in this browser."
                : "Start a practice session for topic-aware suggestions. Until then, these are deterministic editor picks."}
            </p>
            <ResourceGrid
              courseNames={courseNames}
              onToggleSaved={toggle}
              recommendationReasons={recommendationReasons}
              resources={recommendations.map((item) => item.resource)}
              savedIds={savedIds}
            />
          </section>

          <section aria-labelledby="open-resources" className="mt-16">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Reuse terms verified</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white" id="open-resources">Open educational resources</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Open licenses and open-source repositories are labeled separately from materials that are only free to access.</p>
            <ResourceGrid courseNames={courseNames} onToggleSaved={toggle} resources={openResources} savedIds={savedIds} />
          </section>
        </>
      ) : null}

      <section aria-labelledby="resource-library" className="mt-16">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Verified catalog</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white" id="resource-library">
              {filters.savedOnly ? "Saved resources" : "Browse all resources"}
            </h2>
            <p aria-live="polite" className="mt-2 text-sm text-slate-500 dark:text-slate-400">{results.length} {results.length === 1 ? "resource" : "resources"} found</p>
          </div>
          {filtersActive ? (
            <button
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 sm:self-auto"
              onClick={() => setFilters(initialFilters)}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
              Clear filters
            </button>
          ) : null}
        </div>

        {results.length > 0 ? (
          <ResourceGrid courseNames={courseNames} onToggleSaved={toggle} resources={results} savedIds={savedIds} />
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <Search aria-hidden="true" className="mx-auto size-7 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">No matching resources</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try a broader search or clear one of the filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
