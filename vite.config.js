import { defineConfig } from "vite";
import pages from "vite-plugin-pages";

export default defineConfig({
  root: "./src",
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  plugins: [
    pages(),
  ],
});
