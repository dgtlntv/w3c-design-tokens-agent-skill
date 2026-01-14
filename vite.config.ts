import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/validate.ts"),
      formats: ["es"],
      fileName: "validate",
    },
    outDir: resolve(__dirname, "dist/skills/design-tokens/scripts"),
    emptyOutDir: false,
    target: "node18",
    rollupOptions: {
      external: [
        // Keep Node.js built-ins external
        "fs/promises",
        "path",
        "url",
      ],
    },
    minify: false,
  },
  ssr: {
    noExternal: true,
  },
})
