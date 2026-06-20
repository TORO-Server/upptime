import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Custom domain (status.torosaba.net) serves from the root.
export default defineConfig({
  plugins: [vue()],
  base: "/",
});
