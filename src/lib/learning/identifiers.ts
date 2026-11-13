import {
  courses,
  getCourseBySlug,
  getCourseLessons,
  getLesson,
  type Course,
  type Lesson,
} from "@/content/course-catalog";
import { getResourceById } from "@/resources/catalog";

export type LessonReference = {
  courseId: string;
  lessonId: string;
  key: string;
  course: Course;
  lesson: Lesson;
};

export function makeLessonKey(courseId: string, lessonId: string) {
  return `${courseId}/${lessonId}`;
}

export function getKnownCourse(courseId: string) {
  return getCourseBySlug(courseId);
}

export function getKnownLesson(courseId: string, lessonId: string): LessonReference | undefined {
  const course = getCourseBySlug(courseId);
  if (!course) return undefined;
  const lesson = getLesson(course, lessonId);
  if (!lesson) return undefined;
  return {
    courseId: course.slug,
    lessonId: lesson.slug,
    key: makeLessonKey(course.slug, lesson.slug),
    course,
    lesson,
  };
}

export function parseLessonKey(value: string): LessonReference | undefined {
  const segments = value.split("/");
  if (segments.length !== 2 || segments.some((segment) => !segment)) return undefined;
  return getKnownLesson(segments[0], segments[1]);
}

export function isKnownResourceId(resourceId: string) {
  return Boolean(getResourceById(resourceId));
}

export function getAllLessonReferences() {
  return courses.flatMap((course) =>
    getCourseLessons(course).map((lesson) => ({
      courseId: course.slug,
      lessonId: lesson.slug,
      key: makeLessonKey(course.slug, lesson.slug),
      course,
      lesson,
    })),
  );
}
