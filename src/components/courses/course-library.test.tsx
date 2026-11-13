import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CourseLibrary } from "./course-library";

describe("CourseLibrary", () => {
  it("renders every catalog course before filters are applied", () => {
    render(<CourseLibrary />);

    expect(screen.getByText(/Showing/)).toHaveTextContent("9 courses");
    expect(screen.getAllByRole("link", { name: /^Explore / })).toHaveLength(9);
  });

  it("filters the catalog by search text", () => {
    render(<CourseLibrary />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search courses" }), {
      target: { value: "psychology" },
    });

    expect(screen.getByText("AP Psychology")).toBeInTheDocument();
    expect(screen.queryByText("AP Calculus BC")).not.toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toHaveTextContent("1");
  });

  it("filters the catalog by category", () => {
    render(<CourseLibrary />);

    fireEvent.click(screen.getByRole("button", { name: "Economics" }));

    expect(screen.getByText("AP Macroeconomics")).toBeInTheDocument();
    expect(screen.getByText("AP Microeconomics")).toBeInTheDocument();
    expect(screen.queryByText("AP Statistics")).not.toBeInTheDocument();
  });

  it("combines search and category filters", () => {
    render(<CourseLibrary />);

    fireEvent.click(screen.getByRole("button", { name: "Mathematics" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search courses" }), {
      target: { value: "statistics" },
    });

    expect(screen.getByText("AP Statistics")).toBeInTheDocument();
    expect(screen.queryByText("AP Calculus BC")).not.toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toHaveTextContent("1 course");
  });

  it("shows a finite empty state and can clear all filters", () => {
    render(<CourseLibrary />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search courses" }), {
      target: { value: "a course that does not exist" },
    });

    expect(screen.getByRole("heading", { name: "No courses match those filters" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getAllByRole("link", { name: /^Explore / })).toHaveLength(9);
  });
});
