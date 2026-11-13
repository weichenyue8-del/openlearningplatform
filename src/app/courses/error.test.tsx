import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CoursesError from "./error";

describe("CoursesError", () => {
  it("offers a bounded error state and retries the route", () => {
    const retry = vi.fn();
    render(<CoursesError error={new Error("hidden detail")} retry={retry} />);

    expect(screen.getByRole("heading", { name: "The course library could not load" })).toBeInTheDocument();
    expect(screen.queryByText("hidden detail")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
