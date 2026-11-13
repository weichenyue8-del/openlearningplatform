import { z } from "zod";

import { getOptionalViewer } from "@/lib/auth/session";
import { readJsonRequest } from "@/lib/learning/api";
import { createClient } from "@/lib/supabase/server";
import { evaluateAnswer } from "@/practice/evaluation";
import { getPracticeQuestionById } from "@/practice/question-bank.server";

const requestSchema = z.object({
  questionId: z.string().min(1).max(80),
  answer: z.union([z.string().max(300), z.array(z.string().max(40)).max(12)]),
  sessionId: z.string().uuid().optional(),
  submissionId: z.string().uuid().optional(),
  courseId: z.string().min(1).max(80).optional(),
  questionIds: z.array(z.string().min(1).max(80)).min(1).max(20).optional(),
}).superRefine((value, context) => {
  const cloudFields = [value.sessionId, value.submissionId, value.courseId, value.questionIds];
  const supplied = cloudFields.filter((field) => field !== undefined).length;
  if (supplied !== 0 && supplied !== cloudFields.length) {
    context.addIssue({
      code: "custom",
      message: "Practice session context must be complete.",
    });
  }
});

const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request: Request) {
  try {
    const requestBody = await readJsonRequest(request, 4_096);
    if (!requestBody.ok) return requestBody.response;
    const body = requestSchema.safeParse(requestBody.value);
    if (!body.success) {
      return Response.json(
        { error: "The submitted answer is not valid." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const question = getPracticeQuestionById(body.data.questionId);
    if (!question) {
      return Response.json(
        { error: "That practice question could not be found." },
        { status: 404, headers: noStoreHeaders },
      );
    }

    if (
      body.data.courseId &&
      (
        body.data.courseId !== question.courseId ||
        !body.data.questionIds?.includes(question.id) ||
        new Set(body.data.questionIds).size !== body.data.questionIds.length
      )
    ) {
      return Response.json(
        { error: "The practice session context does not match this question." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const result = evaluateAnswer(question, body.data.answer);
    if (!result.valid) {
      return Response.json(result, { status: 422, headers: noStoreHeaders });
    }

    const viewer = await getOptionalViewer();
    const hasCloudContext = Boolean(
      body.data.sessionId &&
      body.data.submissionId &&
      body.data.courseId &&
      body.data.questionIds,
    );

    if (!viewer || !hasCloudContext) {
      return Response.json(
        { ...result, persistence: { status: "guest" as const } },
        { headers: noStoreHeaders },
      );
    }

    // The database RPC re-grades the submitted answer from private answer
    // rules. It does not accept correctness, totals, timestamps, or a user ID
    // from this request, so a direct client cannot manufacture performance.
    const supabase = await createClient();
    if (!supabase) {
      return Response.json(
        { ...result, persistence: { status: "failed" as const } },
        { headers: noStoreHeaders },
      );
    }
    const { error: persistenceError } = await supabase.rpc("record_practice_attempt", {
      p_session_id: body.data.sessionId,
      p_submission_id: body.data.submissionId,
      p_question_id: body.data.questionId,
      p_course_id: body.data.courseId,
      p_question_ids: body.data.questionIds,
      p_submitted_answer: body.data.answer,
    });

    return Response.json(
      {
        ...result,
        persistence: { status: persistenceError ? "failed" as const : "saved" as const },
      },
      { headers: noStoreHeaders },
    );
  } catch {
    return Response.json(
      { error: "The submitted answer could not be read." },
      { status: 400, headers: noStoreHeaders },
    );
  }
}
