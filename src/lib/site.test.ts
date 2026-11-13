import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site";

describe("siteConfig", () => {
  it("does not invent optional project URLs", () => {
    expect(siteConfig.githubUrl).toBeNull();
    expect(siteConfig.contactUrl).toBeNull();
  });
});
