# KOL-Dashboard — Project Rules

## Stack
- React 18 + TypeScript (`strict`) + Vite 5 + Tailwind 3
- `react-router-dom` 6, `recharts` 2 for charts, `lucide-react` for icons
- No backend yet. The data layer is in-memory: React Context over mock/seed data.

## Commands
- `npm run dev` — dev server on `:5173`, base path `/`
- `npm run lint` — type-check only (`tsc --noEmit` for the app and node configs). **There is no ESLint.**
- `npm run build` — `tsc -b && vite build`, production base path `/KOL-Dashboard/`
- Deploy: push to `main` → `.github/workflows/deploy.yml` type-checks, builds, and publishes to GitHub Pages.

## Hard constraints
- **Type-check must pass.** `strict`, `noUnusedLocals`, and `noUnusedParameters` are all on. Never leave an unused variable, import, or function parameter behind.
- **Never `git commit` or `git push` without an explicit user instruction.** The user controls staging and commit messages.
- **Don't add dependencies without asking.** The bundle is already ~684 kB and Vite warns above 500 kB.

## Structure
- `src/pages/` — one file per route. Public-facing pages go in `src/pages/public/`.
- `src/components/` — split by feature: `layout/`, `shared/`, `overview/`, `campaigns/`, `kols/`, `applications/`, `reports/`, `public/`.
- `src/context/` — `ApplicationsContext`, `CampaignsContext`. **All state reads and writes go through a context.** Components must not import from `src/data/` directly.
- `src/data/` — mock and seed data only (`mockData.ts`, `seedApplications.ts`, `stores.ts`).
- `src/types/index.ts` — the single source of truth for domain types.

## Conventions
- Import with the `@/` alias (`@/components/shared/StatCard`), never relative paths.
- Reuse the shared components — `StatCard`, `SectionCard`, `StatusBadge`, `PlatformBadge`, `ProgressBar`, `EmptyState`, `PageHeader`. Do not write look-alikes.
- Tailwind only. The palette is `slate`; follow the spacing, `rounded-lg` / `rounded-xl`, and border patterns already in the codebase.
- Icons always come from `lucide-react` — never inline SVG or emoji icons.
- Extend domain types in `src/types/index.ts`. Never redeclare a shape locally.
- Contexts follow the existing pattern: `createContext` with a `null` default, plus a hook that throws when the provider is missing. Memoize with `useCallback` / `useMemo`.
- IDs and slugs come from the existing helpers — `slugify`, `uniqueSlug`, `nextId` in `CampaignsContext`, `generateId` in `ApplicationsContext`. Don't hand-roll IDs.

## Routing and deploy gotchas
- The app uses `HashRouter`. Public campaign pages are at `/c/:slug`, so a share link is `#/c/<slug>`.
- `vite.config.ts` sets `base` to `/KOL-Dashboard/` **for builds only** and `/` for dev. Don't hardcode absolute asset paths — use React Router `Link` or relative URLs.
- The public campaign page renders inside `PublicLayout` with no dashboard chrome. Anything added there must not depend on dashboard-only state.

## Two surfaces, one model
The dashboard is for the marketer; the public page is for the KOL applying to a campaign. Both read the same `Campaign` type. When you add a field to a campaign that the public page needs, thread it through `src/types/index.ts` **and** both contexts, and add it to the public page — a field that only exists in the dashboard is a bug waiting to happen.
