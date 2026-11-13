import type {
  PracticeQuestion,
  PracticeQuestionMeta,
  PublicPracticeQuestion,
} from "./types";

export function toPublicQuestion(question: PracticeQuestion): PublicPracticeQuestion {
  return {
    id: question.id,
    courseId: question.courseId,
    unitId: question.unitId,
    unitLabel: question.unitLabel,
    topicId: question.topicId,
    topicLabel: question.topicLabel,
    lessonSlug: question.lessonSlug,
    difficulty: question.difficulty,
    type: question.type,
    content: question.content,
    options: question.options,
  };
}

export function toQuestionMeta(question: PracticeQuestion): PracticeQuestionMeta {
  const publicQuestion = toPublicQuestion(question);
  return {
    id: publicQuestion.id,
    courseId: publicQuestion.courseId,
    unitId: publicQuestion.unitId,
    unitLabel: publicQuestion.unitLabel,
    topicId: publicQuestion.topicId,
    topicLabel: publicQuestion.topicLabel,
    lessonSlug: publicQuestion.lessonSlug,
    difficulty: publicQuestion.difficulty,
    type: publicQuestion.type,
  };
}
