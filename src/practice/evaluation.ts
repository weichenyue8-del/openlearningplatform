import type {
  AnswerValue,
  EvaluationResult,
  PracticeQuestion,
  QuestionGradingRule,
  QuestionOption,
} from "./types";

const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

export function normalizeShortAnswer(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

function baseSuccess(question: PracticeQuestion, correct: boolean): EvaluationResult {
  return {
    valid: true,
    correct,
    correctAnswer: question.answerDisplay,
    explanation: question.explanation,
    explanationFormula: question.explanationFormula,
    optionExplanations: question.optionExplanations,
  };
}

function optionIds(options: QuestionOption[] | undefined) {
  return new Set((options ?? []).map((option) => option.id));
}

function evaluateChoice(
  question: PracticeQuestion,
  rule: Extract<QuestionGradingRule, { kind: "multiple-choice" }>,
  answer: AnswerValue,
): EvaluationResult {
  if (typeof answer !== "string" || !optionIds(question.options).has(answer)) {
    return { valid: false, error: "Choose one of the available answers." };
  }

  return baseSuccess(question, answer === rule.correctOptionId);
}

function evaluateMultipleSelect(
  question: PracticeQuestion,
  rule: Extract<QuestionGradingRule, { kind: "multiple-select" }>,
  answer: AnswerValue,
): EvaluationResult {
  const validIds = optionIds(question.options);
  if (
    !Array.isArray(answer) ||
    answer.length === 0 ||
    answer.some((id) => typeof id !== "string" || !validIds.has(id))
  ) {
    return { valid: false, error: "Select one or more of the available answers." };
  }

  const submitted = [...new Set(answer)].sort();
  const expected = [...new Set(rule.correctOptionIds)].sort();
  const correct =
    submitted.length === expected.length &&
    submitted.every((value, index) => value === expected[index]);

  return baseSuccess(question, correct);
}

export function parseFiniteNumber(value: string) {
  const normalized = value.trim();
  if (!normalized || !numberPattern.test(normalized)) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function evaluateNumerical(
  question: PracticeQuestion,
  rule: Extract<QuestionGradingRule, { kind: "numerical" }>,
  answer: AnswerValue,
): EvaluationResult {
  if (typeof answer !== "string") {
    return { valid: false, error: "Enter a valid finite number." };
  }

  const parsed = parseFiniteNumber(answer);
  if (parsed === undefined) {
    return { valid: false, error: "Enter a valid finite number." };
  }

  const scale = Math.max(1, Math.abs(parsed), Math.abs(rule.value));
  const roundingAllowance = Number.EPSILON * scale * 4;
  const correct = Math.abs(parsed - rule.value) <= rule.tolerance + roundingAllowance;
  return baseSuccess(question, correct);
}

function evaluateShortAnswer(
  question: PracticeQuestion,
  rule: Extract<QuestionGradingRule, { kind: "short-answer" }>,
  answer: AnswerValue,
): EvaluationResult {
  if (typeof answer !== "string" || !answer.trim()) {
    return { valid: false, error: "Enter a short answer before submitting." };
  }

  const normalized = normalizeShortAnswer(answer);
  const accepted = new Set(rule.acceptedAnswers.map(normalizeShortAnswer));
  return baseSuccess(question, accepted.has(normalized));
}

export function evaluateAnswer(question: PracticeQuestion, answer: AnswerValue): EvaluationResult {
  const rule = question.grading;
  switch (rule.kind) {
    case "multiple-choice":
      return evaluateChoice(question, rule, answer);
    case "multiple-select":
      return evaluateMultipleSelect(question, rule, answer);
    case "numerical":
      return evaluateNumerical(question, rule, answer);
    case "short-answer":
      return evaluateShortAnswer(question, rule, answer);
  }
}
