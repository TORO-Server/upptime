import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Custom domain (status.torosaba.net) serves from the root.
export default defineConfig({
  plugins: [vue()],
  base: "/",
  build: {
    // three.js is large; raise the warning ceiling and split it into its own chunk.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
});
