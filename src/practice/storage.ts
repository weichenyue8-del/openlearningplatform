import { z } from "zod";

import type { PracticeSession, StoredAttempt } from "./types";

export const PRACTICE_STORAGE_KEY = "openap.practice.sessions.v1";
const MAX_SESSIONS = 25;

const answerSchema = z.union([z.string(), z.array(z.string())]);
const publicQuestionSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  unitId: z.string(),
  unitLabel: z.string(),
  topicId: z.string(),
  topicLabel: z.string(),
  lessonSlug: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.enum(["multiple-choice", "multiple-select", "numerical", "short-answer"]),
  content: z.object({
    prompt: z.string(),
    formula: z.string().optional(),
    code: z.string().optional(),
  }),
  options: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
});

const attemptSchema = z.object({
  question: publicQuestionSchema,
  submittedAnswer: answerSchema,
  result: z.object({
    valid: z.literal(true),
    correct: z.boolean(),
    correctAnswer: z.string(),
    explanation: z.string(),
    explanationFormula: z.string().optional(),
    optionExplanations: z.record(z.string(), z.string()).optional(),
  }),
  submittedAt: z.string(),
});

const sessionSchema = z.object({
  version: z.literal(1),
  id: z.string().min(8),
  courseId: z.string(),
  courseTitle: z.string(),
  questionIds: z.array(z.string()),
  filters: z.object({
    unitId: z.string().optional(),
    topicId: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }),
  returnTo: z.string().optional(),
  attempts: z.array(attemptSchema),
  startedAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});

const storedSessionsSchema = z.array(sessionSchema);

function storageAvailable() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function readPracticeSessions(): PracticeSession[] {
  if (!storageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(PRACTICE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = storedSessionsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function writePracticeSessions(sessions: PracticeSession[]) {
  if (!storageAvailable()) return false;
  try {
    window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
    return true;
  } catch {
    return false;
  }
}

export function upsertPracticeSession(session: PracticeSession) {
  const existing = readPracticeSessions().filter((item) => item.id !== session.id);
  return writePracticeSessions([session, ...existing]);
}

export function getPracticeSession(sessionId: string) {
  return readPracticeSessions().find((session) => session.id === sessionId);
}

export function getAllStoredAttempts(): StoredAttempt[] {
  return readPracticeSessions().flatMap((session) => session.attempts);
}

export function createSafeSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    // RFC 4122 UUIDv4 formatting keeps fallback IDs valid for Postgres `uuid`
    // columns when a browser does not expose crypto.randomUUID().
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  throw new Error("Secure session identifiers are not available in this browser.");
}

export function sanitizeReturnPath(value: string | undefined) {
  if (!value || value.startsWith("//")) return undefined;
  if (value.startsWith("/courses/") || value.startsWith("/practice/results/")) return value;
  return undefined;
}
