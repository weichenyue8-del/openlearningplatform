import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { LearningResource } from "@/resources/types";

import { VideoPlayer } from "./video-player";

const videoResource: LearningResource = {
  id: "java-arrays-video",
  title: "Java Arrays Explained",
  description: "A concise introduction to Java arrays.",
  provider: "YouTube",
  creator: "OpenAP Teacher",
  type: "youtube-video",
  subject: "Computer Science",
  difficulty: "beginner",
  access: "free-access",
  url: "https://www.youtube.com/watch?v=abc123XYZ_0",
  courseIds: ["ap-computer-science-a"],
  topicIds: ["arrays"],
  topicLabels: ["Arrays"],
  lessonRefs: [],
  youtubeVideoId: "abc123XYZ_0",
  embedStatus: "verified",
  attribution: "Video by OpenAP Teacher on YouTube.",
  verified: true,
  lastVerifiedAt: "2026-11-12",
  addedAt: "2026-11-12",
  editorialOrder: 1,
};

describe("VideoPlayer", () => {
  afterEach(() => vi.useRealTimers());

  it("does not contact YouTube until play, then uses the privacy-enhanced embed", () => {
    vi.useFakeTimers();
    const { container } = render(
      <VideoPlayer relatedCourse="AP Computer Science A" resource={videoResource} />,
    );

    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.getByText("YouTube loads only after you choose to play")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play Java Arrays Explained" }));

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/abc123XYZ_0",
    );
    expect(iframe).toHaveAttribute(
      "title",
      "Java Arrays Explained by OpenAP Teacher",
    );
    expect(iframe).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(screen.getByRole("status")).toHaveTextContent("Loading video…");

    fireEvent.load(iframe!);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);

    act(() => vi.advanceTimersByTime(20_000));
    expect(container.querySelector("iframe")).toBeInTheDocument();
    expect(screen.queryByText("This video could not load here.")).not.toBeInTheDocument();
  });

  it("shows a safe external fallback when a video is link-only", () => {
    const { container } = render(
      <VideoPlayer
        resource={{ ...videoResource, embedStatus: "link-only", youtubeVideoId: undefined }}
      />,
    );

    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.getByText("This video is available on YouTube.")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Open on YouTube" });
    expect(link).toHaveAttribute("href", videoResource.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("offers the external fallback when an embed takes too long to load", () => {
    vi.useFakeTimers();
    const { container } = render(<VideoPlayer resource={videoResource} />);

    fireEvent.click(screen.getByRole("button", { name: "Play Java Arrays Explained" }));
    expect(container.querySelector("iframe")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(12_000));

    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.getByText("This video could not load here.")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Open on YouTube" });
    expect(link).toHaveAttribute("href", videoResource.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("clears its pending load timeout when unmounted", () => {
    vi.useFakeTimers();
    const { unmount } = render(<VideoPlayer resource={videoResource} />);

    fireEvent.click(screen.getByRole("button", { name: "Play Java Arrays Explained" }));
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

});
