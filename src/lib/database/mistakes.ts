import "server-only";

import { getCourseBySlug } from "@/content/course-catalog";
import type { DataResult, MistakeFilters, MistakeReviewItem } from "@/lib/learning/types";
import { createClient } from "@/lib/supabase/server";
import {
  getPracticeQuestionById,
  getPracticeQuestionMetadata,
} from "@/practice/question-bank.server";
import type { AnswerValue, PracticeQuestion } from "@/practice/types";

import { ownsRequestedUser, unauthorizedDataResult } from "./authorization";

type AttemptRow = {
  id: string;
  question_id: string;
  submitted_answer: unknown;
  created_at: string;
};

function normalizeAnswer(value: unknown): AnswerValue | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value as string[];
  }
  return undefined;
}

function displayAnswer(question: PracticeQuestion, value: unknown) {
  const answer = normalizeAnswer(value);
  if (answer === undefined) return "Answer unavailable";
  if (Array.isArray(answer)) {
    return answer
      .map((id) => question.options?.find((option) => option.id === id)?.text ?? id)
      .join(", ");
  }
  if (question.type === "multiple-choice") {
    return question.options?.find((option) => option.id === answer)?.text ?? answer;
  }
  return answer;
}

export async function getMistakeReview(
  userId: string,
  filters: MistakeFilters = {},
): Promise<DataResult<MistakeReviewItem[]>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const matchingQuestions = getPracticeQuestionMetadata({
    courseId: filters.courseId,
    topicId: filters.topicId,
  });
  if (matchingQuestions.length === 0) return { ok: true, data: [] };
  const questionIds = matchingQuestions.map((question) => question.id);
  const incorrectResult = await supabase
    .from("question_attempts")
    .select("id, question_id, submitted_answer, created_at")
    .eq("user_id", userId)
    .eq("is_correct", false)
    .in("question_id", questionIds)
    .order("created_at", { ascending: false })
    .limit(250);
  if (incorrectResult.error) {
    return { ok: false, error: "Your mistake history could not be loaded." };
  }
  const incorrect = Array.isArray(incorrectResult.data)
    ? (incorrectResult.data as AttemptRow[])
    : [];
  if (incorrect.length === 0) return { ok: true, data: [] };

  const attemptedQuestionIds = [...new Set(incorrect.map((attempt) => attempt.question_id))];
  const correctResult = await supabase
    .from("question_attempts")
    .select("question_id, created_at")
    .eq("user_id", userId)
    .eq("is_correct", true)
    .in("question_id", attemptedQuestionIds)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (correctResult.error) {
    return { ok: false, error: "Review status could not be calculated." };
  }
  const latestCorrect = new Map<string, string>();
  for (const row of (correctResult.data ?? []) as Array<{
    question_id: string;
    created_at: string;
  }>) {
    if (!latestCorrect.has(row.question_id)) latestCorrect.set(row.question_id, row.created_at);
  }

  return {
    ok: true,
    data: incorrect.flatMap((attempt): MistakeReviewItem[] => {
      const question = getPracticeQuestionById(attempt.question_id);
      const course = question ? getCourseBySlug(question.courseId) : undefined;
      if (!question || !course) return [];
      const correctAt = latestCorrect.get(question.id);
      return [
        {
          id: attempt.id,
          questionId: question.id,
          prompt: question.content.prompt,
          courseId: course.slug,
          courseTitle: course.title,
          topicId: question.topicId,
          topicLabel: question.topicLabel,
          submittedAnswer: displayAnswer(question, attempt.submitted_answer),
          correctAnswer: question.answerDisplay,
          explanation: question.explanation,
          attemptedAt: attempt.created_at,
          reviewed: Boolean(correctAt && correctAt > attempt.created_at),
          retryHref: `/practice/${course.slug}?ids=${encodeURIComponent(question.id)}`,
        },
      ];
    }),
  };
}
