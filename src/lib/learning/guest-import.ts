import { z } from "zod";

const timestamp = z.string().datetime({ offset: true });
const answer = z.union([
  z.string().max(300),
  z.array(z.string().min(1).max(40)).min(1).max(12),
]);

const enrollment = z
  .object({
    courseId: z.string().min(1).max(80),
    enrolledAt: timestamp,
    lastAccessedAt: timestamp,
  })
  .strict();

const lessonProgress = z
  .object({
    lessonKey: z.string().min(3).max(180),
    completed: z.boolean(),
    updatedAt: timestamp,
  })
  .strict();

const bookmark = z
  .object({
    resourceId: z.string().min(1).max(120),
    savedAt: timestamp,
  })
  .strict();

const practiceAttempt = z
  .object({
    sourceId: z.string().min(1).max(120).optional(),
    questionId: z.string().min(1).max(80),
    answer,
    submittedAt: timestamp,
  })
  .strict();

const practiceSession = z
  .object({
    sourceId: z.string().min(8).max(120),
    courseId: z.string().min(1).max(80),
    questionIds: z.array(z.string().min(1).max(80)).min(1).max(20),
    startedAt: timestamp,
    completedAt: timestamp.optional(),
    attempts: z.array(practiceAttempt).max(20),
  })
  .strict();

export const guestLearningImportSchema = z
  .object({
    version: z.literal(1),
    enrollments: z.array(enrollment).max(25).default([]),
    lessonProgress: z.array(lessonProgress).max(500).default([]),
    bookmarks: z.array(bookmark).max(200).default([]),
    practiceSessions: z.array(practiceSession).max(25).default([]),
  })
  .strict();

export type GuestLearningImport = z.infer<typeof guestLearningImportSchema>;

export type GuestImportReport = {
  status: "complete" | "partial";
  imported: {
    enrollments: number;
    lessonProgress: number;
    bookmarks: number;
    practiceAttempts: number;
  };
  skipped: {
    enrollments: number;
    lessonProgress: number;
    bookmarks: number;
    practiceAttempts: number;
  };
  messages: string[];
};
