import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"

const config = defineConfig({
  plugins: [
    // Polyfill Node.js globals needed by CosmJS in the browser.
    // protocolImports: false prevents intercepting node: protocol imports used by Nitro/crossws
    nodePolyfills({
      include: ["buffer", "crypto", "stream", "util", "process"],
      protocolImports: false,
    }),
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    include: [
      "@cosmjs/stargate",
      "@cosmjs/proto-signing",
      "@cosmjs/encoding",
    ],
  },
})

export default config
