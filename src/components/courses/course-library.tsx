"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { courseCategories, courses } from "@/content/course-catalog";

import { CourseCard } from "./course-card";

const allCategories = ["All", ...courseCategories] as const;

export function CourseLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof allCategories)[number]>("All");

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCategory = category === "All" || course.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.description.toLowerCase().includes(normalizedQuery) ||
        course.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <label className="relative block">
          <span className="sr-only">Search courses</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-950 dark:focus:ring-blue-950"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by course, subject, or topic…"
            type="search"
            value={query}
          />
        </label>
        <div className="mt-4 flex items-start gap-3">
          <SlidersHorizontal aria-hidden="true" className="mt-2.5 hidden size-4 shrink-0 text-slate-400 sm:block" />
          <div aria-label="Filter by category" className="flex flex-wrap gap-2" role="group">
            {allCategories.map((item) => {
              const active = category === item;
              return (
                <button
                  aria-pressed={active}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  }`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-slate-600 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-950 dark:text-white">{filteredCourses.length}</span> {filteredCourses.length === 1 ? "course" : "courses"}
        </p>
        {(query || category !== "All") && (
          <button
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            type="button"
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredCourses.length > 0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard course={course} key={course.slug} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">No courses match those filters</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Try another keyword or clear the selected category.</p>
        </div>
      )}
    </div>
  );
}
