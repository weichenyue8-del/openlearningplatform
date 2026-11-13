import { difficulties, type DifficultyPerformance, type StoredAttempt, type TopicPerformance } from "./types";

export function calculateAccuracy(attempts: StoredAttempt[]) {
  const correct = attempts.filter((attempt) => attempt.result.correct).length;
  const total = attempts.length;
  return {
    total,
    correct,
    incorrect: total - correct,
    accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}

export function isSessionComplete(questionIds: string[], attempts: StoredAttempt[]) {
  if (questionIds.length === 0) return false;
  const attemptedIds = new Set(attempts.map((attempt) => attempt.question.id));
  return questionIds.every((id) => attemptedIds.has(id));
}

export function calculateTopicPerformance(attempts: StoredAttempt[]): TopicPerformance[] {
  const grouped = new Map<string, Omit<TopicPerformance, "accuracy">>();

  for (const attempt of attempts) {
    const key = `${attempt.question.courseId}:${attempt.question.topicId}`;
    const current = grouped.get(key) ?? {
      topicId: attempt.question.topicId,
      topicLabel: attempt.question.topicLabel,
      attempts: 0,
      correct: 0,
      incorrect: 0,
    };
    current.attempts += 1;
    if (attempt.result.correct) current.correct += 1;
    else current.incorrect += 1;
    grouped.set(key, current);
  }

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      accuracy: item.attempts === 0 ? 0 : Math.round((item.correct / item.attempts) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || a.topicLabel.localeCompare(b.topicLabel));
}

export function calculateDifficultyPerformance(attempts: StoredAttempt[]): DifficultyPerformance[] {
  return difficulties
    .map((difficulty) => {
      const matching = attempts.filter((attempt) => attempt.question.difficulty === difficulty);
      const correct = matching.filter((attempt) => attempt.result.correct).length;
      return {
        difficulty,
        attempts: matching.length,
        correct,
        incorrect: matching.length - correct,
        accuracy: matching.length === 0 ? 0 : Math.round((correct / matching.length) * 100),
      };
    })
    .filter((item) => item.attempts > 0);
}
