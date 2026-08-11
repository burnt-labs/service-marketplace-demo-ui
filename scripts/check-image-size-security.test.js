import { describe, expect, it } from "vitest"

describe("image-size security patches", () => {
  it("rejects malicious ICNS and ISO BMFF inputs", async () => {
    await import("./check-image-size-security.js")
    expect(true).toBe(true)
  })
})
