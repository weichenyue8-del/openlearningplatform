import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { upsertPracticeSession } from "@/practice/storage";
import type { PracticeQuestionMeta, PracticeSession } from "@/practice/types";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Bar: () => null,
}));

import { PracticeResults } from "./practice-results";

const questionMeta: PracticeQuestionMeta[] = [{
  id: "q1",
  courseId: "course",
  unitId: "unit",
  unitLabel: "Unit",
  topicId: "limits",
  topicLabel: "Limits",
  difficulty: "easy",
  type: "multiple-choice",
}];

const storedSession: PracticeSession = {
  version: 1,
  id: "session-results-123",
  courseId: "course",
  courseTitle: "Practice Course",
  questionIds: ["q1"],
  filters: { topicId: "limits" },
  returnTo: "/courses/ap-calculus-bc/limits-and-continuity",
  attempts: [{
    question: {
      ...questionMeta[0],
      content: { prompt: "Find the limit." },
      options: [
        { id: "a", text: "6" },
        { id: "b", text: "3" },
        { id: "c", text: "0" },
        { id: "d", text: "DNE" },
      ],
    },
    submittedAnswer: "b",
    result: {
      valid: true,
      correct: false,
      correctAnswer: "6",
      explanation: "Factor and cancel.",
    },
    submittedAt: "2026-11-12T00:01:00.000Z",
  }],
  startedAt: "2026-11-12T00:00:00.000Z",
  updatedAt: "2026-11-12T00:01:00.000Z",
  completedAt: "2026-11-12T00:01:00.000Z",
};

describe("PracticeResults", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders actual session totals, mistake review, retry, and lesson return", async () => {
    upsertPracticeSession(storedSession);
    render(<PracticeResults questionMeta={questionMeta} sessionId={storedSession.id} />);

    expect(await screen.findByRole("heading", { name: "Practice Completed!" })).toBeInTheDocument();
    expect(screen.getByText("Questions answered").parentElement).toHaveTextContent("1");
    expect(screen.getByText("Correct answers").parentElement).toHaveTextContent("0");
    expect(screen.getByText("Incorrect answers").parentElement).toHaveTextContent("1");
    expect(screen.getAllByText("Accuracy")[0].parentElement).toHaveTextContent("0%");
    expect(screen.getByRole("link", { name: "Retry incorrect · 1" })).toHaveAttribute("href", expect.stringContaining("ids=q1"));
    expect(screen.getByRole("link", { name: "Return to Lesson" })).toHaveAttribute("href", storedSession.returnTo);
    expect(screen.getByText("Find the limit.")).toBeInTheDocument();
  });

  it("shows an honest recovery state for an unknown local session", async () => {
    render(<PracticeResults questionMeta={questionMeta} sessionId="missing-session" />);
    expect(await screen.findByRole("heading", { name: "Results not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to practice" })).toHaveAttribute("href", "/practice");
  });
});
