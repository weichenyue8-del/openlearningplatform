import type { Metadata } from "next";

import { PracticeDashboard } from "@/components/practice/practice-dashboard";
import {
  getPracticeCourseSummaries,
  getPracticeQuestionMetadata,
} from "@/practice/question-bank.server";

export const metadata: Metadata = {
  title: "Practice",
  description: "Build AP skills with original interactive questions, instant feedback, and local progress insights.",
};

export default function PracticePage() {
  return (
    <PracticeDashboard
      courses={getPracticeCourseSummaries()}
      questionMeta={getPracticeQuestionMetadata()}
    />
  );
}
