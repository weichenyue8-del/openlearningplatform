import { describe, expect, it } from "vitest";

import { learningResources } from "./catalog";
import { verifyCatalogAvailability } from "./link-verification";

const runLiveChecks = process.env.VERIFY_RESOURCE_LINKS === "1";

describe.runIf(runLiveChecks)("live learning resource links", () => {
  it("keeps every reviewed source available", async () => {
    const results = await verifyCatalogAvailability(learningResources);
    const failures = results.filter(
      (result) => !result.available || result.embedAvailable === false,
    );
    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
  }, 180_000);
});
