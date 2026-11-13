import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { PracticeCourseSummary, PracticeQuestionMeta } from "@/practice/types";

import { PracticeDashboard } from "./practice-dashboard";

const courses: PracticeCourseSummary[] = [
  {
    id: "course-a",
    title: "Course A",
    shortTitle: "A",
    category: "Mathematics",
    icon: "calculus",
    description: "A course.",
    questionCount: 2,
    difficulties: ["easy", "hard"],
  },
  {
    id: "course-b",
    title: "Course B",
    shortTitle: "B",
    category: "Science",
    icon: "physics",
    description: "Coming later.",
    questionCount: 0,
    difficulties: [],
  },
];

const questionMeta: PracticeQuestionMeta[] = [
  { id: "q1", courseId: "course-a", unitId: "unit-1", unitLabel: "Unit One", topicId: "topic-1", topicLabel: "Topic One", difficulty: "easy", type: "multiple-choice" },
  { id: "q2", courseId: "course-a", unitId: "unit-1", unitLabel: "Unit One", topicId: "topic-2", topicLabel: "Topic Two", difficulty: "hard", type: "numerical" },
];

describe("PracticeDashboard", () => {
  beforeEach(() => window.localStorage.clear());

  it("cascades working course, unit, topic, and difficulty filters", () => {
    render(<PracticeDashboard courses={courses} questionMeta={questionMeta} />);
    expect(screen.getByText("2 questions match these filters.")).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Course"), { target: { value: "course-a" } });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "unit-1" } });
    fireEvent.change(screen.getByLabelText("Topic"), { target: { value: "topic-2" } });
    fireEvent.change(screen.getByLabelText("Difficulty"), { target: { value: "hard" } });

    expect(screen.getByText("1 question matches these filters.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start Practicing · 1" })).toHaveAttribute(
      "href",
      "/practice/course-a?unit=unit-1&topic=topic-2&difficulty=hard",
    );
    expect(screen.queryByRole("heading", { name: "Course B" })).not.toBeInTheDocument();
  });
});
