import { defineConfig } from "vite";
import copy from "rollup-plugin-copy";

export default defineConfig({
  plugins: [
    copy({
      targets: [
        { src: "manifest.json", dest: "dist" },
        { src: "icons/*", dest: "dist/icons" },
      ],
      hook: "writeBundle",
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        background: "src/background.ts",
        contentScript: "src/contentScript.ts",
        style: "src/styles.css",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
