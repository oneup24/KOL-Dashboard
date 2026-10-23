import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { readFileSync } from "node:fs";

// The app is a static SPA that can be hosted at the domain root (Netlify)
// or under a repo sub-path (GitHub Pages project pages).
//
//   GitHub Pages  ->  https://oneup24.github.io/KOL-Dashboard/   base "/KOL-Dashboard/"
//   Netlify       ->  https://kol-24.netlify.app/                 base "/"
//
// Override with the BASE_PATH env var — netlify.toml sets it to "/" for the
// Netlify build. Dev always uses "/" so `npm run dev` is unaffected.
const REPO_NAME = "KOL-Dashboard";

/* ── link-preview pages ──────────────────────────────────────────────────── */

interface PreviewCampaign {
  slug: string;
  name: string;
  productName: string;
  productDescription: string;
  productImage: string;
  productUrl: string;
  campaignBrief: string;
  disclosureText?: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * A static page per campaign that carries the Open Graph / Twitter tags.
 *
 * Link preview fetchers (Messenger, WhatsApp, Facebook, X, Slack) parse the
 * served HTML and do not execute JavaScript — so the tags written by the
 * running app are invisible to them. This page is plain HTML at a stable
 * path, so the preview works. It hands the visitor over to the hash-routed
 * app immediately.
 */
const renderPreviewPage = (c: PreviewCampaign, base: string, siteUrl: string): string => {
  const title = `${c.productName} — FX Creations KOL Campaign`;
  const description = c.productDescription || c.campaignBrief;
  const path_ = `${base}c/${c.slug}/`;
  const absoluteUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}${path_}` : path_;
  const appUrl = `${base}#/c/${c.slug}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(absoluteUrl)}" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="FX Creations" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(c.productImage)}" />
<meta property="og:url" content="${escapeHtml(absoluteUrl)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(c.productImage)}" />

<script>
  location.replace(${JSON.stringify(appUrl)});
</script>
<style>
  body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; }
  .wrap { max-width: 32rem; margin: 0 auto; padding: 3rem 1.5rem; text-align: center; }
  img { width: 100%; max-width: 22rem; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 1rem; box-shadow: 0 10px 30px rgb(15 23 42 / 0.12); }
  h1 { font-size: 1.375rem; margin: 1.5rem 0 0.5rem; letter-spacing: -0.02em; }
  p { color: #475569; font-size: 0.9375rem; line-height: 1.6; }
  a { display: inline-block; margin-top: 1.5rem; padding: 0.625rem 1.25rem; background: #0f172a; color: #fff; border-radius: 0.5rem; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
</style>
</head>
<body>
  <div class="wrap">
    <img src="${escapeHtml(c.productImage)}" alt="${escapeHtml(c.productName)}" />
    <h1>${escapeHtml(c.productName)}</h1>
    <p>${escapeHtml(description)}</p>
    <a href="${escapeHtml(appUrl)}">Open the campaign</a>
  </div>
  <noscript>
    <div class="wrap"><p>JavaScript is disabled. <a href="${escapeHtml(appUrl)}">Open the campaign</a></p></div>
  </noscript>
</body>
</html>
`;
};

/**
 * Base-aware 404. The app uses hash routing, so every real route lives on the
 * index document — this just sends a visitor who hit a bare path back to it,
 * preserving whatever hash they arrived with.
 */
const renderNotFound = (base: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>FX Creations KOL</title>
<script>
  location.replace(${JSON.stringify(base)} + (location.hash || ""));
</script>
<style>
  body { margin: 0; display: grid; place-items: center; min-height: 100vh; font-family: ui-sans-serif, system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
  p { color: #475569; font-size: 0.9375rem; }
</style>
</head>
<body><p>Taking you to the dashboard…</p></body>
</html>
`;

const previewPages = (
  campaigns: PreviewCampaign[],
  siteUrl: string,
  base: string,
): Plugin => ({
  name: "fx-campaign-preview-pages",
  apply: "build",
  generateBundle(_options, _bundle) {
    for (const campaign of campaigns) {
      this.emitFile({
        type: "asset",
        fileName: `c/${campaign.slug}/index.html`,
        source: renderPreviewPage(campaign, base, siteUrl),
      });
    }
    this.emitFile({
      type: "asset",
      fileName: "404.html",
      source: renderNotFound(base),
    });
  },
});

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base =
    env.BASE_PATH ??
    process.env.BASE_PATH ??
    (command === "build" ? `/${REPO_NAME}/` : "/");

  // Netlify exposes the site URL as URL during a build; GitHub Actions does
  // not, so og:url simply stays relative there.
  const siteUrl = process.env.SITE_URL ?? process.env.URL ?? "";

  // The campaign seed data is read from the JSON manifest at the repo root so
  // the config never has to import across the TypeScript project boundary.
  const campaignManifest = JSON.parse(
    readFileSync(path.resolve(__dirname, "campaign-seeds.json"), "utf8"),
  ) as PreviewCampaign[];

  return {
    plugins: [react(), previewPages(campaignManifest, siteUrl, base)],
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
