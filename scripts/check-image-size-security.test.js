import { describe, expect, it } from "vitest"

describe("image-size security patches", () => {
  it("rejects malicious ICNS and ISO BMFF inputs", async () => {
    await expect(
      import("./check-image-size-security.js")
    ).resolves.toBeDefined()
  })
})
