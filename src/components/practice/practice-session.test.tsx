import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicPracticeQuestion } from "@/practice/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { PracticeSession } from "./practice-session";

const question: PublicPracticeQuestion = {
  id: "calc-limits-test",
  courseId: "ap-calculus-bc",
  unitId: "limits",
  unitLabel: "Limits",
  topicId: "limits",
  topicLabel: "Limits",
  difficulty: "easy",
  type: "multiple-choice",
  content: { prompt: "What is the limit?" },
  options: [
    { id: "a", text: "6" },
    { id: "b", text: "3" },
    { id: "c", text: "0" },
    { id: "d", text: "Does not exist" },
  ],
};

describe("PracticeSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/practice/ap-calculus-bc");
  });

  it("hides answers before submission, blocks duplicate submits, then shows feedback", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      valid: true,
      correct: false,
      correctAnswer: "6",
      explanation: "Factor and cancel before taking the limit.",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PracticeSession
        courseTitle="AP Calculus BC"
        filters={{ topicId: "limits" }}
        initialQuestions={[question]}
      />,
    );

    await screen.findByRole("heading", { name: "What is the limit?" });
    expect(screen.queryByText(/Correct answer:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Factor and cancel/)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("radio")[1]);
    const submit = screen.getByRole("button", { name: "Submit answer" });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(await screen.findByRole("heading", { name: "Not quite yet" })).toBeInTheDocument();
    expect(screen.getByText(/Correct answer:/).closest("p")).toHaveTextContent("Correct answer: 6");
    expect(screen.getByText(/Factor and cancel before taking the limit/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1"));
  });
});
