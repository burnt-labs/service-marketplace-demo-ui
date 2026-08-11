import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { cloudflare } from "@cloudflare/vite-plugin"

const config = defineConfig(({ mode }) => ({
  plugins: [
    // Polyfill Node.js globals needed by CosmJS in the browser.
    // protocolImports: false prevents intercepting node: protocol imports used by Nitro/crossws
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    ...(mode === "test"
      ? []
      : [
          cloudflare({
            viteEnvironment: {
              name: "ssr",
            },
          }),
        ]),
  ],
  optimizeDeps: {
    include: ["@cosmjs/stargate", "@cosmjs/proto-signing", "@cosmjs/encoding"],
  },
}))

export default config
