"use client";

import { ExternalLink, LoaderCircle, Play, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import type { LearningResource } from "@/resources/types";

type VideoPlayerProps = {
  resource: LearningResource;
  relatedCourse?: string;
};

const VIDEO_LOAD_TIMEOUT_MS = 12_000;

export function VideoPlayer({ resource, relatedCourse }: VideoPlayerProps) {
  const [started, setStarted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const canEmbed = resource.embedStatus === "verified" && Boolean(resource.youtubeVideoId);
  const topic = resource.topicLabels[0];

  useEffect(() => {
    if (!canEmbed || !started || loaded || failed) return;

    const timeoutId = window.setTimeout(() => setFailed(true), VIDEO_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [canEmbed, failed, loaded, started]);

  if (!canEmbed || failed) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center rounded-2xl bg-slate-950 p-6 text-center text-white">
        <TriangleAlert aria-hidden="true" className="size-7 text-amber-300" />
        <p className="mt-3 text-sm font-semibold">
          {failed ? "This video could not load here." : "This video is available on YouTube."}
        </p>
        <a
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-100"
          href={resource.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open on YouTube
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-center text-white">
        <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#60a5fa_0,transparent_28%),radial-gradient(circle_at_80%_80%,#818cf8_0,transparent_25%)]" />
        <button
          className="relative grid size-14 place-items-center rounded-full bg-white text-blue-700 shadow-xl shadow-black/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
          onClick={() => setStarted(true)}
          type="button"
        >
          <span className="sr-only">Play {resource.title}</span>
          <Play aria-hidden="true" className="ml-0.5 size-6 fill-current" />
        </button>
        <p className="relative mt-4 line-clamp-2 max-w-lg text-sm font-bold">{resource.title}</p>
        <p className="relative mt-1 text-xs text-slate-300">
          {resource.creator}{relatedCourse ? ` · ${relatedCourse}` : ""}{topic ? ` · ${topic}` : ""}
        </p>
        <p className="relative mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-300">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          YouTube loads only after you choose to play
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950">
      {!loaded ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950 text-white" role="status">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
            Loading video…
          </span>
        </div>
      ) : null}
      <iframe
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
        loading="lazy"
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        referrerPolicy="strict-origin-when-cross-origin"
        src={`https://www.youtube-nocookie.com/embed/${resource.youtubeVideoId}`}
        title={`${resource.title} by ${resource.creator ?? resource.provider}`}
      />
    </div>
  );
}
