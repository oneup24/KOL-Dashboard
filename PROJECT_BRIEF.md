# Project Brief — KOL Dashboard

> What this line is, who it serves, what "done" means. Read alongside `RULES.md`
> (how to work here) and `scripts/google-sheets-setup.md` (the Sheets integration).

## What it is

The marketing console for a Hong Kong KOL (key opinion leader) agency. The founder manages
campaigns, the KOL roster and applications through it; KOLs apply to campaigns through a public
share page.

Two surfaces, one data model:

- **Dashboard** — campaigns, KOL CRM, applications, reports, settings.
- **Public campaign page** at `#/c/<slug>` — what a KOL sees when they open a share link.

## Stack

React 18 + TypeScript (`strict`) + Vite 5 + Tailwind 3. `react-router-dom` 6 with **HashRouter**,
`recharts` for charts, `lucide-react` for icons.

Deployed to **both** GitHub Pages (`/KOL-Dashboard/` base) and Netlify (`/` base). `vite.config.ts`
reads `BASE_PATH` from the environment and emits one static Open Graph page per campaign plus a
`404.html` that bounces to the app.

## The Google Sheets backbone

Campaigns and applications persist to a Google Sheet via Apps Script
(`scripts/google-sheets.gas`), not to a normal database. The Sheets URL lives in the
**marketer's** browser `localStorage`.

That single fact drives the two known constraints:

1. A public KOL applying from their own phone has no Sheets URL, so their application does not
   reach the sheet. It dies with the tab.
2. `campaign-seeds.json` is the source for both the app's seed campaigns and the static Open Graph
   pages, and nothing regenerates it — so a campaign created in the dashboard is invisible to
   visitors until that file is rebuilt.

## Who it serves

The founder (marketer) — not a developer. Every screen must stand on its own without explanation.

## What "done" means

- `npm run lint` passes — that is the whole lint story; there is no ESLint here.
- `npm run build` passes, and the built `dist/index.html` references the right base path.
- The live site serves the new build (asset hash matches the local build).
- Nothing is committed or pushed without the founder saying so. `scripts/publish.sh` is the only
  sanctioned path to GitHub; it pushes the current branch, and only `main` triggers a deploy.

## Team

| Agent | Owns |
|---|---|
| `lead` | Planning and delegation. Cannot edit — routes work to specialists. |
| `dashboard-ui` | Pages, components, Tailwind, charts, the public campaign page |
| `dashboard-data` | `src/types`, `src/context/*`, `src/data/*`, the Sheets client |
| `dashboard-reviewer` | Read-only audit: type safety, React correctness, routing, duplication, a11y |
| `dashboard-release` | The gate: lint + build, then report and ask before any push |
