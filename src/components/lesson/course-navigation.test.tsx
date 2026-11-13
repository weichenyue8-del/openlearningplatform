import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getCourseBySlug } from "@/content/course-catalog";

import { CourseNavigation } from "./course-navigation";

describe("CourseNavigation", () => {
  it("links every lesson and marks the current lesson", () => {
    const course = getCourseBySlug("ap-calculus-bc");
    expect(course).toBeDefined();
    if (!course) return;

    render(
      <CourseNavigation
        activeLessonSlug="introduction-to-derivatives"
        course={course}
      />,
    );

    const current = screen.getByRole("link", { name: "Introduction to Derivatives" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute(
      "href",
      "/courses/ap-calculus-bc/introduction-to-derivatives",
    );
    expect(screen.getByRole("link", { name: "Limits and Continuity" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });
});
