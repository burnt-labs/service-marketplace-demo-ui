# Resolve dependency vulnerabilities

1. Map all 109 open Dependabot alerts to direct framework packages and transitive dependency roots.
2. Upgrade the TanStack, Nitro, Cloudflare, Vite, test, and XION dependency families together.
3. Remove any remaining unpatched cryptographic or image parser paths with tested replacements.
4. Add GitHub Actions security gates and validate frozen install, audit, tests, types, lint, and production build.
5. Publish a signed remediation PR and verify its exact GitHub head and checks.
