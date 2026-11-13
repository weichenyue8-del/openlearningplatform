import type { StoredAttempt } from "@/practice/types";

import type { LearningResource, ResourceDifficulty } from "./types";

export type ResourceRecommendation = {
  resource: LearningResource;
  score: number;
  reason: string;
};

export type RecommendationContext = {
  courseId?: string;
  topicId?: string;
  topicLabel?: string;
};

type TopicSignal = {
  courseId: string;
  topicId: string;
  topicLabel: string;
  attempts: number;
  accuracy: number;
};

const difficultyForAccuracy = (accuracy: number): ResourceDifficulty => {
  if (accuracy < 0.6) return "beginner";
  if (accuracy < 0.85) return "intermediate";
  return "advanced";
};

function buildTopicSignals(attempts: StoredAttempt[]) {
  const recent = [...attempts]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 60);
  const groups = new Map<string, { attempts: StoredAttempt[]; label: string }>();

  for (const attempt of recent) {
    const key = `${attempt.question.courseId}:${attempt.question.topicId}`;
    const group = groups.get(key) ?? { attempts: [], label: attempt.question.topicLabel };
    group.attempts.push(attempt);
    groups.set(key, group);
  }

  return [...groups.entries()].map(([key, group]): TopicSignal => {
    const separator = key.indexOf(":");
    const correct = group.attempts.filter((attempt) => attempt.result.correct).length;
    return {
      courseId: key.slice(0, separator),
      topicId: key.slice(separator + 1),
      topicLabel: group.label,
      attempts: group.attempts.length,
      accuracy: correct / group.attempts.length,
    };
  });
}

/**
 * Deterministic, local-only ranking. Practice results never leave the browser.
 * Topic/course relevance is weighted most heavily, followed by difficulty fit
 * and a small editorial signal. This is a study aid, not a mastery diagnosis.
 */
export function recommendResources(
  resources: LearningResource[],
  attempts: StoredAttempt[],
  context: RecommendationContext = {},
): ResourceRecommendation[] {
  const topicSignals = buildTopicSignals(attempts);
  const weakestSignals = [...topicSignals].sort(
    (a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts || a.topicId.localeCompare(b.topicId),
  );

  return resources
    .map((resource): ResourceRecommendation => {
      let score = Math.max(0, 0.05 - resource.editorialOrder / 10_000);
      let reason = "Curated by OpenAP for its clear educational value";

      const contextTopicMatch = Boolean(context.topicId && resource.topicIds.includes(context.topicId));
      const contextCourseMatch = Boolean(context.courseId && resource.courseIds.includes(context.courseId));
      if (contextTopicMatch) {
        score += 0.55;
        reason = `Directly supports ${context.topicLabel ?? context.topicId}`;
      }
      if (contextCourseMatch) score += 0.2;

      const weakMatch = weakestSignals.find(
        (signal) =>
          resource.courseIds.includes(signal.courseId) &&
          resource.topicIds.includes(signal.topicId),
      );
      if (weakMatch) {
        const errorRate = 1 - weakMatch.accuracy;
        score += errorRate * 0.5 + Math.min(weakMatch.attempts / 10, 0.1);
        if (!contextTopicMatch) {
          reason = `Reinforce ${weakMatch.topicLabel} after ${Math.round(weakMatch.accuracy * 100)}% recent accuracy`;
        }
        if (resource.difficulty === difficultyForAccuracy(weakMatch.accuracy)) score += 0.12;
      } else {
        const courseSignal = weakestSignals.find((signal) =>
          resource.courseIds.includes(signal.courseId),
        );
        if (courseSignal) {
          score += 0.16;
          reason = `Continue learning in ${courseSignal.courseId.replaceAll("-", " ")}`;
          if (resource.difficulty === difficultyForAccuracy(courseSignal.accuracy)) score += 0.08;
        }
      }

      if (attempts.length === 0 && resource.featured) score += 0.35;
      if (resource.access !== "free-access") score += 0.02;

      return { resource, score, reason };
    })
    .sort((a, b) => b.score - a.score || a.resource.id.localeCompare(b.resource.id));
}
