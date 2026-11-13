export const questionTypes = [
  "multiple-choice",
  "multiple-select",
  "numerical",
  "short-answer",
] as const;

export const difficulties = ["easy", "medium", "hard"] as const;

export type QuestionType = (typeof questionTypes)[number];
export type Difficulty = (typeof difficulties)[number];
export type AnswerValue = string | string[];

export type QuestionOption = {
  id: string;
  text: string;
};

export type QuestionContent = {
  prompt: string;
  formula?: string;
  code?: string;
};

export type QuestionGradingRule =
  | { kind: "multiple-choice"; correctOptionId: string }
  | { kind: "multiple-select"; correctOptionIds: string[] }
  | { kind: "numerical"; value: number; tolerance: number }
  | { kind: "short-answer"; acceptedAnswers: string[] };

export type PracticeQuestion = {
  id: string;
  courseId: string;
  unitId: string;
  unitLabel: string;
  topicId: string;
  topicLabel: string;
  lessonSlug?: string;
  difficulty: Difficulty;
  type: QuestionType;
  content: QuestionContent;
  options?: QuestionOption[];
  grading: QuestionGradingRule;
  answerDisplay: string;
  explanation: string;
  explanationFormula?: string;
  optionExplanations?: Record<string, string>;
};

/** Browser-safe question data. Deliberately excludes grading and explanations. */
export type PublicPracticeQuestion = Omit<
  PracticeQuestion,
  | "grading"
  | "answerDisplay"
  | "explanation"
  | "explanationFormula"
  | "optionExplanations"
>;

export type PracticeQuestionMeta = Pick<
  PublicPracticeQuestion,
  | "id"
  | "courseId"
  | "unitId"
  | "unitLabel"
  | "topicId"
  | "topicLabel"
  | "lessonSlug"
  | "difficulty"
  | "type"
>;

export type EvaluationSuccess = {
  valid: true;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  explanationFormula?: string;
  optionExplanations?: Record<string, string>;
  persistence?: {
    status: "saved" | "guest" | "failed";
  };
};

export type EvaluationFailure = {
  valid: false;
  error: string;
};

export type EvaluationResult = EvaluationSuccess | EvaluationFailure;

export type StoredAttempt = {
  question: PublicPracticeQuestion;
  submittedAnswer: AnswerValue;
  result: EvaluationSuccess;
  submittedAt: string;
};

export type SessionFilters = {
  unitId?: string;
  topicId?: string;
  difficulty?: Difficulty;
};

export type PracticeSession = {
  version: 1;
  id: string;
  courseId: string;
  courseTitle: string;
  questionIds: string[];
  filters: SessionFilters;
  returnTo?: string;
  attempts: StoredAttempt[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type TopicPerformance = {
  topicId: string;
  topicLabel: string;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
};

export type DifficultyPerformance = {
  difficulty: Difficulty;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
};

export type PracticeCourseSummary = {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  icon: string;
  description: string;
  questionCount: number;
  difficulties: Difficulty[];
};
