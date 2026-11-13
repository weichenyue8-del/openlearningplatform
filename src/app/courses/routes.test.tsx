import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CoursePage, {
  generateStaticParams as generateCourseParams,
} from "./[courseSlug]/page";
import LessonPage, {
  generateStaticParams as generateLessonParams,
} from "./[courseSlug]/[lessonSlug]/page";
import CoursesPage from "./page";

describe("course route regression", () => {
  it("renders the public course library without account configuration", () => {
    render(<CoursesPage />);

    expect(screen.getByRole("heading", { name: "Find your next subject." })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Explore / })).toHaveLength(9);
  });

  it("publishes a route for every catalog course and reviewed lesson", () => {
    const courseParams = generateCourseParams();
    const lessonParams = generateLessonParams();

    expect(courseParams).toHaveLength(9);
    expect(courseParams).toContainEqual({ courseSlug: "ap-calculus-bc" });
    expect(lessonParams).toHaveLength(6);
    expect(lessonParams).toContainEqual({
      courseSlug: "ap-calculus-bc",
      lessonSlug: "limits-and-continuity",
    });
  });

  it("renders a course detail route from local catalog data", async () => {
    const page = await CoursePage({
      params: Promise.resolve({ courseSlug: "ap-calculus-bc" }),
      searchParams: Promise.resolve({}),
    });
    render(page);

    expect(screen.getByRole("heading", { name: "AP Calculus BC", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start first lesson/ })).toHaveAttribute(
      "href",
      "/courses/ap-calculus-bc/limits-and-continuity",
    );
  });

  it("renders lesson navigation from local content", async () => {
    const page = await LessonPage({
      params: Promise.resolve({
        courseSlug: "ap-calculus-bc",
        lessonSlug: "limits-and-continuity",
      }),
      searchParams: Promise.resolve({}),
    });
    render(page);

    expect(screen.getByRole("heading", { name: "Limits and Continuity", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Next lesson\s*Introduction to Derivatives/ })).toHaveAttribute(
      "href",
      "/courses/ap-calculus-bc/introduction-to-derivatives",
    );
  });

  it("returns the Next.js not-found boundary for an unknown course", async () => {
    await expect(CoursePage({
      params: Promise.resolve({ courseSlug: "not-a-real-course" }),
      searchParams: Promise.resolve({}),
    })).rejects.toThrow(/404/);
  });
});
