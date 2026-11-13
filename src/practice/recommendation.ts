import type { PracticeQuestionMeta, StoredAttempt } from "./types";

export type RecommendedQuestion = {
  question: PracticeQuestionMeta;
  score: number;
  reason: string;
};

const difficultySignal = { easy: 0.2, medium: 0.5, hard: 0.8 } as const;

/**
 * Transparent heuristic (not a validated mastery measure):
 * 55% recent error rate + 20% limited evidence + 20% prior miss + 5% difficulty.
 * Unattempted topics receive a neutral 50% error estimate so they are explored,
 * while actual weak topics and previously missed questions rise to the top.
 */
export function recommendQuestions(
  questions: PracticeQuestionMeta[],
  attempts: StoredAttempt[],
): RecommendedQuestion[] {
  const recentAttempts = [...attempts]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 40);

  return questions
    .map((question) => {
      const topicAttempts = recentAttempts.filter(
        (attempt) =>
          attempt.question.courseId === question.courseId &&
          attempt.question.topicId === question.topicId,
      );
      const correct = topicAttempts.filter((attempt) => attempt.result.correct).length;
      const accuracy = topicAttempts.length === 0 ? 0.5 : correct / topicAttempts.length;
      const errorRate = 1 - accuracy;
      const limitedEvidence = 1 / Math.sqrt(topicAttempts.length + 1);
      const previousAttempt = recentAttempts.find(
        (attempt) => attempt.question.id === question.id,
      );
      const priorMiss = previousAttempt && !previousAttempt.result.correct ? 1 : 0;
      const score =
        errorRate * 0.55 +
        limitedEvidence * 0.2 +
        priorMiss * 0.2 +
        difficultySignal[question.difficulty] * 0.05;

      let reason = `Build more evidence in ${question.topicLabel}`;
      if (priorMiss) reason = `Revisit a question previously missed in ${question.topicLabel}`;
      else if (topicAttempts.length > 0 && accuracy < 0.7) {
        reason = `Strengthen ${question.topicLabel} after ${Math.round(accuracy * 100)}% recent accuracy`;
      }

      return { question, score, reason };
    })
    .sort((a, b) => b.score - a.score || a.question.id.localeCompare(b.question.id));
}

export function prioritizePublicQuestionIds(
  questionIds: string[],
  questionMeta: PracticeQuestionMeta[],
  attempts: StoredAttempt[],
) {
  const allowed = new Set(questionIds);
  return recommendQuestions(
    questionMeta.filter((question) => allowed.has(question.id)),
    attempts,
  ).map((recommendation) => recommendation.question.id);
}
