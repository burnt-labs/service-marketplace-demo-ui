//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  { ignores: ["scripts/**", "third_party/**"] },
  ...tanstackConfig,
]
