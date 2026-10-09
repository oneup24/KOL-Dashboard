import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Hosted at https://oneup24.github.io/KOL-Dashboard/
// base is set to the repo subpath only for production builds; `/` is kept
// for `npm run dev` so local development isn't affected.
const REPO_NAME = "KOL-Dashboard";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? `/${REPO_NAME}/` : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
}));
