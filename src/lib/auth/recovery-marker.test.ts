import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createRecoveryMarker,
  RECOVERY_MARKER_MAX_AGE_SECONDS,
  verifyRecoveryMarker,
} from "./recovery-marker";

const now = Date.UTC(2026, 10, 13, 9, 0, 0);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("password recovery markers", () => {
  it("creates a short-lived marker bound to the recovered user", () => {
    vi.stubEnv("OPENAP_AUTH_RECOVERY_SECRET", "a-secure-test-secret-with-at-least-32-characters");
    const marker = createRecoveryMarker("user-a", now);

    expect(marker).toBeTruthy();
    expect(verifyRecoveryMarker(marker ?? undefined, "user-a", now)).toBe(true);
    expect(verifyRecoveryMarker(marker ?? undefined, "user-b", now)).toBe(false);
    expect(
      verifyRecoveryMarker(
        marker ?? undefined,
        "user-a",
        now + (RECOVERY_MARKER_MAX_AGE_SECONDS + 1) * 1_000,
      ),
    ).toBe(false);
  });

  it("rejects tampered markers and missing server configuration", () => {
    vi.stubEnv("OPENAP_AUTH_RECOVERY_SECRET", "a-secure-test-secret-with-at-least-32-characters");
    const marker = createRecoveryMarker("user-a", now);
    expect(verifyRecoveryMarker(`${marker}tampered`, "user-a", now)).toBe(false);

    vi.stubEnv("OPENAP_AUTH_RECOVERY_SECRET", "too-short");
    expect(createRecoveryMarker("user-a", now)).toBeNull();
  });
});
