import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// The app is a static SPA that can be hosted at the domain root (Netlify)
// or under a repo sub-path (GitHub Pages project pages).
//
//   GitHub Pages  ->  https://oneup24.github.io/KOL-Dashboard/   base "/KOL-Dashboard/"
//   Netlify       ->  https://kol-24.netlify.app/                 base "/"
//
// Override with the BASE_PATH env var — netlify.toml sets it to "/" for the
// Netlify build. Dev always uses "/" so `npm run dev` is unaffected.
const REPO_NAME = "KOL-Dashboard";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base =
    env.BASE_PATH ??
    process.env.BASE_PATH ??
    (command === "build" ? `/${REPO_NAME}/` : "/");

  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
    },
  };
});
