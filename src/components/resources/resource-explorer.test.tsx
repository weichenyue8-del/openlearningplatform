import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { LearningResource } from "@/resources/types";

import { ResourceExplorer } from "./resource-explorer";

const resources: LearningResource[] = [
  {
    id: "java-arrays-video",
    title: "Java Arrays Explained",
    description: "Learn how Java arrays store values.",
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
  },
  {
    id: "python-control-flow-docs",
    title: "Python Control Flow Guide",
    description: "Official documentation for Python control flow.",
    provider: "Python Software Foundation",
    type: "documentation",
    subject: "Computer Science",
    difficulty: "intermediate",
    access: "open-licensed",
    url: "https://docs.python.org/3/tutorial/controlflow.html",
    courseIds: ["ap-computer-science-a"],
    topicIds: ["control-flow"],
    topicLabels: ["Control Flow"],
    lessonRefs: [],
    license: "PSF License",
    attribution: "Python documentation by the Python Software Foundation.",
    verified: true,
    lastVerifiedAt: "2026-11-12",
    addedAt: "2026-11-11",
    editorialOrder: 2,
  },
  {
    id: "calculus-textbook",
    title: "Open Calculus Textbook",
    description: "A reusable calculus textbook.",
    provider: "Open Textbook Library",
    type: "textbook",
    subject: "Mathematics",
    difficulty: "intermediate",
    access: "open-licensed",
    url: "https://example.com/open-calculus",
    courseIds: ["ap-calculus-bc"],
    topicIds: ["limits"],
    topicLabels: ["Limits"],
    lessonRefs: [],
    license: "CC BY 4.0",
    attribution: "Open calculus textbook.",
    verified: true,
    lastVerifiedAt: "2026-11-12",
    addedAt: "2026-11-10",
    editorialOrder: 3,
  },
];

const courseNames = {
  "ap-computer-science-a": "AP Computer Science A",
  "ap-calculus-bc": "AP Calculus BC",
};

describe("ResourceExplorer", () => {
  beforeEach(() => window.localStorage.clear());

  it("combines course search, subject, type, and difficulty filters", () => {
    render(<ResourceExplorer courseNames={courseNames} resources={resources} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search resources" }), {
      target: { value: "AP Computer Science A" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Computer Science" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Resource type" }), {
      target: { value: "documentation" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Difficulty" }), {
      target: { value: "intermediate" },
    });

    expect(screen.getByText("1 resource found")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Python Control Flow Guide" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Java Arrays Explained" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Open Calculus Textbook" })).not.toBeInTheDocument();
  });

  it("bookmarks a resource and limits the library to the saved view", () => {
    render(<ResourceExplorer courseNames={courseNames} resources={resources} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search resources" }), {
      target: { value: "Java Arrays" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Java Arrays Explained" }));

    expect(
      screen.getByRole("button", { name: "Remove Java Arrays Explained from saved resources" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Saved resources (1)" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "Saved resources (1)" }));

    expect(screen.getByRole("heading", { name: "Saved resources" })).toBeInTheDocument();
    expect(screen.getByText("1 resource found")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Java Arrays Explained" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Open Calculus Textbook" })).not.toBeInTheDocument();
  });
});
