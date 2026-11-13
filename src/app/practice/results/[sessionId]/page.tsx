import type { Metadata } from "next";

import { PracticeResults } from "@/components/practice/practice-results";
import { getPracticeQuestionMetadata } from "@/practice/question-bank.server";

export const metadata: Metadata = {
  title: "Practice Results",
  description: "Review local practice results, topic performance, and missed questions.",
};

export default async function PracticeResultsPage({
  params,
}: PageProps<"/practice/results/[sessionId]">) {
  const { sessionId } = await params;
  return (
    <PracticeResults
      questionMeta={getPracticeQuestionMetadata()}
      sessionId={sessionId.slice(0, 80)}
    />
  );
}
