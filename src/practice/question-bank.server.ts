import "server-only";

import { courses, getCourseBySlug, getLesson } from "@/content/course-catalog";

import { toPublicQuestion, toQuestionMeta } from "./public-question";
import { calculusQuestions } from "./question-bank/calculus.private";
import { computerScienceQuestions } from "./question-bank/computer-science.private";
import { macroeconomicsQuestions } from "./question-bank/macroeconomics.private";
import { microeconomicsQuestions } from "./question-bank/microeconomics.private";
import type {
  Difficulty,
  PracticeCourseSummary,
  PracticeQuestion,
  PracticeQuestionMeta,
  PublicPracticeQuestion,
} from "./types";

const questions: PracticeQuestion[] = [
  ...calculusQuestions,
  ...computerScienceQuestions,
  ...macroeconomicsQuestions,
  ...microeconomicsQuestions,
];

function validateQuestionBank(bank: PracticeQuestion[]) {
  const ids = new Set<string>();
  for (const question of bank) {
    if (ids.has(question.id)) throw new Error(`Duplicate practice question ID: ${question.id}`);
    ids.add(question.id);
    if (question.type !== question.grading.kind) {
      throw new Error(`Question ${question.id} has a mismatched grading rule.`);
    }
    if (
      (question.type === "multiple-choice" || question.type === "multiple-select") &&
      question.options?.length !== 4
    ) {
      throw new Error(`Question ${question.id} must have exactly four options.`);
    }
    const course = getCourseBySlug(question.courseId);
    if (!course) {
      throw new Error(`Question ${question.id} references an unknown course.`);
    }
    if (question.lessonSlug && !getLesson(course, question.lessonSlug)) {
      throw new Error(`Question ${question.id} references an unknown lesson.`);
    }
  }
}

validateQuestionBank(questions);

export type QuestionFilters = {
  courseId?: string;
  unitId?: string;
  topicId?: string;
  difficulty?: Difficulty;
  ids?: string[];
};

function filterQuestions(filters: QuestionFilters) {
  const requestedIds = filters.ids ? new Set(filters.ids) : undefined;
  const matching = questions.filter((question) => {
    if (filters.courseId && question.courseId !== filters.courseId) return false;
    if (filters.unitId && question.unitId !== filters.unitId) return false;
    if (filters.topicId && question.topicId !== filters.topicId) return false;
    if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
    if (requestedIds && !requestedIds.has(question.id)) return false;
    return true;
  });

  if (!filters.ids) return matching.sort((a, b) => a.id.localeCompare(b.id));
  const order = new Map(filters.ids.map((id, index) => [id, index]));
  return matching.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export function getPublicPracticeQuestions(filters: QuestionFilters): PublicPracticeQuestion[] {
  return filterQuestions(filters).map(toPublicQuestion);
}

export function getPracticeQuestionMetadata(filters: QuestionFilters = {}): PracticeQuestionMeta[] {
  return filterQuestions(filters).map(toQuestionMeta);
}

export function getPracticeQuestionById(questionId: string) {
  return questions.find((question) => question.id === questionId);
}

export function getPracticeCourseSummaries(): PracticeCourseSummary[] {
  return courses.map((course) => {
    const courseQuestions = questions.filter((question) => question.courseId === course.slug);
    return {
      id: course.slug,
      title: course.title,
      shortTitle: course.shortTitle,
      category: course.category,
      icon: course.icon,
      description: course.description,
      questionCount: courseQuestions.length,
      difficulties: [...new Set(courseQuestions.map((question) => question.difficulty))],
    };
  });
}

export function getLessonPracticeLink(courseId: string, lessonSlug: string) {
  const matching = questions.filter(
    (question) => question.courseId === courseId && question.lessonSlug === lessonSlug,
  );
  if (matching.length === 0) return undefined;
  const topicIds = [...new Set(matching.map((question) => question.topicId))];
  return {
    count: matching.length,
    topicId: topicIds.length === 1 ? topicIds[0] : undefined,
  };
}
