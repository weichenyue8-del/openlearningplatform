import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema, updatePasswordSchema } from "./schemas";

describe("authentication schemas", () => {
  it("normalizes valid signup identity fields", () => {
    const result = signUpSchema.parse({
      displayName: "  Ada Student  ",
      email: "  ADA@example.com ",
      password: "correct horse battery staple",
      confirmPassword: "correct horse battery staple",
    });

    expect(result.displayName).toBe("Ada Student");
    expect(result.email).toBe("ADA@example.com");
  });

  it("rejects mismatched signup passwords", () => {
    const result = signUpSchema.safeParse({
      displayName: "Ada Student",
      email: "ada@example.com",
      password: "long-enough-password",
      confirmPassword: "different-password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        "Passwords do not match.",
      );
    }
  });

  it("requires a valid login email and a non-empty password", () => {
    expect(signInSchema.safeParse({ email: "not-an-email", password: "" }).success).toBe(false);
  });

  it("enforces the password length limit on recovery", () => {
    expect(
      updatePasswordSchema.safeParse({
        password: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });
});
