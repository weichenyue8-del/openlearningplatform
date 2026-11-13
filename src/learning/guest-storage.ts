import { z } from "zod";

export const GUEST_LEARNING_STORAGE_KEY = "openap.learning.guest.v1";
export const GUEST_LEARNING_EVENT = "openap:guest-learning-changed";

const MAX_ENROLLMENTS = 25;
const MAX_LESSON_PROGRESS = 500;

const guestLearningSchema = z.object({
  version: z.literal(1),
  enrollments: z.array(z.object({
    courseId: z.string().min(1).max(80),
    enrolledAt: z.string().datetime(),
    lastAccessedAt: z.string().datetime(),
  })).max(MAX_ENROLLMENTS),
  lessonProgress: z.array(z.object({
    lessonKey: z.string().min(3).max(180),
    completed: z.boolean(),
    updatedAt: z.string().datetime(),
  })).max(MAX_LESSON_PROGRESS),
});

export type GuestLearningStore = z.infer<typeof guestLearningSchema>;

const emptyStore: GuestLearningStore = {
  version: 1,
  enrollments: [],
  lessonProgress: [],
};

function canStore() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function parseGuestLearningStore(raw: string | null): GuestLearningStore {
  if (!raw) return emptyStore;
  try {
    const parsed = guestLearningSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return emptyStore;
    return {
      version: 1,
      enrollments: [...new Map(
        parsed.data.enrollments.map((item) => [item.courseId, item]),
      ).values()].slice(0, MAX_ENROLLMENTS),
      lessonProgress: [...new Map(
        parsed.data.lessonProgress.map((item) => [item.lessonKey, item]),
      ).values()].slice(0, MAX_LESSON_PROGRESS),
    };
  } catch {
    return emptyStore;
  }
}

export function readGuestLearningStore() {
  if (!canStore()) return emptyStore;
  try {
    return parseGuestLearningStore(window.localStorage.getItem(GUEST_LEARNING_STORAGE_KEY));
  } catch {
    return emptyStore;
  }
}

export function writeGuestLearningStore(store: GuestLearningStore) {
  if (!canStore()) return false;
  try {
    window.localStorage.setItem(GUEST_LEARNING_STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(GUEST_LEARNING_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function touchGuestEnrollment(courseId: string, now = new Date()) {
  const current = readGuestLearningStore();
  const existing = current.enrollments.find((item) => item.courseId === courseId);
  const timestamp = now.toISOString();
  const next = {
    version: 1 as const,
    enrollments: [
      {
        courseId,
        enrolledAt: existing?.enrolledAt ?? timestamp,
        lastAccessedAt: timestamp,
      },
      ...current.enrollments.filter((item) => item.courseId !== courseId),
    ].slice(0, MAX_ENROLLMENTS),
    lessonProgress: current.lessonProgress,
  };
  return { written: writeGuestLearningStore(next), item: next.enrollments[0] };
}

export function removeGuestEnrollment(courseId: string) {
  const current = readGuestLearningStore();
  return writeGuestLearningStore({
    ...current,
    enrollments: current.enrollments.filter((item) => item.courseId !== courseId),
  });
}

export function setGuestLessonCompletion(
  courseId: string,
  lessonId: string,
  completed: boolean,
  now = new Date(),
) {
  const lessonKey = `${courseId}/${lessonId}`;
  const enrollment = touchGuestEnrollment(courseId, now);
  const current = readGuestLearningStore();
  const next = {
    ...current,
    lessonProgress: [
      { lessonKey, completed, updatedAt: now.toISOString() },
      ...current.lessonProgress.filter((item) => item.lessonKey !== lessonKey),
    ].slice(0, MAX_LESSON_PROGRESS),
  };
  return { written: enrollment.written && writeGuestLearningStore(next), lessonKey };
}

export function isGuestEnrolled(courseId: string) {
  return readGuestLearningStore().enrollments.some((item) => item.courseId === courseId);
}

export function isGuestLessonComplete(courseId: string, lessonId: string) {
  const key = `${courseId}/${lessonId}`;
  return readGuestLearningStore().lessonProgress.find((item) => item.lessonKey === key)?.completed
    ?? false;
}
