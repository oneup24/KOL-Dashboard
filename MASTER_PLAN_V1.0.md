# Master Plan — V1.0

> The direction of the KOL Dashboard: what the product is, how the workflow runs, and which
> phase each piece of work belongs to. This document is the **map**.
> `TO-DO.md` is the **live checklist** — what happens next, in order.
>
> Companion docs: `PROJECT_BRIEF.md` (what it is), `RULES.md` (how to work here),
> `docs/google-sheets-setup.md` (the Sheets integration).

---

## 1. The product

A marketing console for a Hong Kong KOL agency. The founder (a marketer at FX Creations) runs
campaigns out of it; KOLs apply through a public link it generates.

Two surfaces, one data model:

| Surface | Who | Route | What it may show |
|---|---|---|---|
| **Dashboard** | the marketer | `#/overview`, `#/campaigns`, `#/kols`, `#/applications`, `#/reports`, `#/settings` | everything — KOL contact details, budgets, internal notes |
| **Public campaign page** | a KOL | `#/c/<slug>` | the campaign, the product, the application form — **never** another KOL's data |

The rule that follows from this: **the public surface must never be able to reach the
dashboard surface.** A KOL who clicks a share link and lands in the CRM is a serious failure,
not a cosmetic one.

---

## 2. The workflow this product runs

This is the founder's actual process, in order. Every phase below serves one of these steps.

```
1  Product decided, campaign needed
2  Campaigns → Create New Campaign
3  Fill in: target KOL count, product + URL, seeding requirement, post window,
   target audience, fee model, promo code setup
4  Create → public link generated → share to KOL (Facebook group, DM, previous contact)
5  Interested KOL opens the link → fills in the application
       social media handle · WhatsApp · email · pickup store · address
6  Application lands in the dashboard
       ├─ stored in the CAMPAIGN's application list
       └─ linked to the KOL CRM record (one master row per person, reused forever)
   Founder reviews → approve or deny
7  Approved → notify the sales team / store to prepare the product
       → message template, one click to copy or open WhatsApp with it pre-filled
   → store confirms ready → notify the KOL to collect
8  KOL collects → promo code issued (per-KOL, so revenue can be attributed)
   → shooting brief + disclosure wording sent
9  Campaign board shows where every KOL in that campaign stands
10 KOL posts → post link + metrics captured → stored on the application AND
   the KOL CRM profile → rolls up into that KOL's history
   → campaign and KOL performance summarised for the boss
```

### Where each step lives today

| Step | Where in the app | Status |
|---|---|---|
| 2–3 | `src/pages/CampaignsPage.tsx` → `NewCampaignDialog.tsx` | Done — 6 tabs |
| 4 | `src/components/applications/ShareCampaignDialog.tsx` | Done — clean URL + hash URL |
| 5 | `src/pages/public/PublicCampaignPage.tsx` → `ApplicationForm.tsx` | Done |
| 6 | `src/pages/ApplicationsPage.tsx`, `src/context/KolContext.tsx` | Done |
| 7 | `src/data/messageTemplates.ts` → `ApplicationMessagePanel.tsx` | Done — copy / WhatsApp link |
| 8 | `src/data/promoCode.ts` | Done — template-driven, owner-configured |
| 9 | `src/pages/CampaignDetailPage.tsx` | Done — kanban, funnel, alerts |
| 10 | `PostCaptureForm.tsx`, `KolContext.getKolStats()` | Done |

---

## 3. The Google Sheets backbone

There is no conventional backend. **A Google Sheet is the database**, reached through an Apps
Script web app (`scripts/google-sheets.gas`).

```
Browser ──POST / GET──▶ Apps Script web app ──▶ Google Sheet
                                  ▲
                                  │  the script URL lives in the MARKETER's
                                  │  browser localStorage
```

Four tabs, one row per record: `Campaigns`, `KOLs`, `Applications`, `MessageLog`.

Three consequences, all of them real and all of them owned:

1. **The Sheets URL is per-browser.** It is `localStorage`, so it must be pasted once per device
   and per browser. An incognito window is a different store. This is the single most likely
   reason a write "silently failed".
2. **The script URL is effectively public.** The public KOL form has to be able to write an
   application, so the script must be reachable without a login — which means anyone who finds
   the URL can read and write the sheet. *Phase 6 addresses the dashboard side; the sheet
   itself is protected by its own sharing settings.*
3. **The public form cannot read the CRM.** A KOL on their own phone has no Sheets URL, so their
   application cannot be written from the browser alone. Today it is written in the app and
   pushed by the marketer's browser — *Phase 8 replaces this with a server-side write.*

---

## 4. Phases

Each phase lists its goal, its scope, and the exit criteria that say it is finished. A phase is
only closed when every exit criterion is met **on the live site**, not in the codebase.

### Phase 0 — Foundation ✅ closed

**Goal:** a real app, not a mockup.

Vite 5 + React 18 + TypeScript (`strict`) + Tailwind 3. `HashRouter`, `recharts`, `lucide-react`.
Shared component set (`StatCard`, `SectionCard`, `StatusBadge`, `PlatformBadge`, `ProgressBar`,
`EmptyState`, `PageHeader`). Deployed to GitHub Pages and Netlify with a green type-check and
build on every push.

**Exit criteria:** `npm run lint` and `npm run build` pass; both hosts serve the current bundle.

---

### Phase 1 — Campaign backend ✅ closed

**Goal:** the marketer can create and run a campaign without touching a spreadsheet.

Campaign model with ~35 fields: product and URL, target KOL count, application cap, application
deadline, **post window** (not just a deadline — content must be *live* inside a window),
structured deliverables, mandatory tags and mentions, disclosure text, product variants with
per-store stock, audience, KOL tiers, fee model with a **display toggle**, and a promo code
pattern.

Create / edit via a six-tab dialog. Duplicate, delete, share. Live status board per campaign.

**Exit criteria:** a campaign can be created end-to-end and shared; the public page renders it.

---

### Phase 2 — KOL CRM ✅ closed

**Goal:** one master record per KOL, reused across every campaign.

`Kol` is the person. `Application` is the join. Applications reference `kolId`; they no longer
copy the KOL's contact details. Applying resolves the handle, finds or creates the CRM row,
and links to it. The CRM rolls up `campaignsDone`, `postsLive`, `avgER`, `lastPostDate` — the
signal that makes the *next* shortlist better than a guess.

**Exit criteria:** the same KOL applying to five campaigns is one CRM row with five
applications.

---

### Phase 3 — Application workflow ✅ closed

**Goal:** the ten-step workflow runs end to end without leaving the dashboard.

Pipeline: `New → Reviewing → Approved → Product Ready → Picked Up → Brief Sent → Content Live
→ Completed`, with `Rejected` as a terminal branch. Approve and Deny are explicit actions; deny
captures a reason. Each transition stamps its own timestamp, so the pipeline is auditable.

Enforced at the public form, not just in the UI: application deadline, application cap, and a
blacklist guard.

Message templates for six scopes with `{{variable}}` interpolation, a copyable rendered message,
a WhatsApp deep link (pre-filled), and a send log.

**Exit criteria:** every transition is reachable, timestamped, and persisted.

---

### Phase 4 — Google Sheets as the database 🟡 in progress

**Goal:** nothing is lost on refresh, and the sheet is the record.

Code is complete: the Apps Script backend (four tabs, column-name addressing, boolean coercion,
safe column append, unknown fields preserved in an `extra` column), the client, the sync
context (read once on load, write through on every mutation), Settings with connection test and
reload, auto-seed of an empty sheet, a diagnostics endpoint, and a live sync banner that
surfaces write failures instead of swallowing them.

**Exit criteria — all still open:**
- [ ] The Apps Script is deployed as a **new version** — the live script is still the old one
- [ ] `ensureSetup()` has run once and the `Campaigns` header is clean (no duplicate columns)
- [ ] `?action=diagnose` returns a report rather than a read payload
- [ ] A campaign created in the dashboard appears in the sheet within seconds
- [ ] A refresh restores campaigns, KOLs and applications from the sheet

---

### Phase 5 — Link sharing and previews ✅ closed

**Goal:** a link that is safe to send in a Facebook group and looks right in Messenger.

Per-campaign static pages with Open Graph and Twitter card tags, so preview crawlers — which do
not run JavaScript — show the product instead of a blank card. Clean `/c/<slug>/` URLs work for
campaigns created at runtime via a Netlify shadowing rewrite, with pathname routing in the app.
The terminal branded 404 guarantees no unknown path can ever land a KOL in the dashboard.

**Exit criteria:** a share link sent in Messenger shows the product; a dead link shows the
branded page and nothing else.

---

### Phase 6 — Protection and trust 🟡 in progress

**Goal:** the KOL database is not readable by anyone with the URL.

Built: an optional dashboard access code (`VITE_DASHBOARD_CODE`), applied to dashboard routes
only — the public campaign page is never gated. A Settings card warns when the dashboard is
unprotected.

**Exit criteria — both open:**
- [ ] `VITE_DASHBOARD_CODE` is set in Netlify and the gate is armed
- [ ] The dashboard is protected by a **host-level** control — Netlify password protection or
      Cloudflare Access — because a client-side code is a speed bump, not authentication

---

### Phase 7 — Targeting intelligence ⬜ not started

**Goal:** shortlist by fit, not by feel.

`platforms`, `kolTiers`, `audience` and `language` are captured on every campaign and every KOL
and are currently stored but never read.

Scope: filter the applications inbox by tier and platform; warn when an applying KOL misses the
audience brief; show a fit score per application against the campaign's targeting.

**Exit criteria:** a campaign with a defined tier and audience produces a ranked, flagged
applicant list.

---

### Phase 8 — Automation ⬜ not started

**Goal:** the marketer stops being the transport layer.

Scope:
- **Server-side public application write.** A Netlify Function holds the Sheets URL and writes
  the application directly, so a KOL's application no longer depends on the marketer's browser.
- **Actual message sending** — WhatsApp Business API or a Facebook Page, instead of copy-and-paste.
- **Metrics capture** from the Instagram Graph API and TikTok API, so post performance is pulled
  rather than typed.

**Exit criteria:** a KOL applies from their own phone and the application is in the sheet
without the marketer doing anything.

---

### Phase 9 — Reporting to the boss ⬜ not started

**Goal:** the weekly update is one button.

The Sheet is already the database and exports exist (CSV, paste-ready TSV, push). What is
missing is the **report** the founder actually sends: campaign performance, delivery against
target, spend, and attributed revenue from promo codes.

Scope: a report view that renders to a paste-ready Google Sheet block, plus promo-code redemption
tracking so revenue can be attributed to a KOL.

**Exit criteria:** one click produces the exact block the founder pastes into their report.

---

### Phase 10 — Scale ⬜ not started

Multi-user safety (concurrent edits are last-write-wins today), role separation, and moving the
Sheet off Google Sheets if it outgrows it. Not until Phases 7–9 show the workflow is real.

---

## 5. Decisions still open

| Decision | Why it matters | Needed by |
|---|---|---|
| Fee model per campaign — gift / money / commission / both | The public page shows nothing about money unless the toggle is on | Phase 1 (already configurable; needs a real value) |
| Promo code value — `%` off, fixed amount, or attribution only | The code is what revenue is attributed through | Phase 9 |
| Dashboard protection — Netlify password vs Cloudflare Access | Only a host-level control actually protects the CRM | Phase 6 |
| Whether the Google Sheet or a proper database is the long-term home | Everything in Phase 10 depends on it | Phase 10 |

---

## 6. Explicit non-goals

- **No drag-and-drop** on the pipeline board. Explicit buttons are faster to use and harder to
  break.
- **No influencer discovery scraping.** KOLs come from Facebook groups and existing contacts.
- **No automated outreach.** The first contact is always a human DM.
- **No new npm dependency without asking.** The bundle is ~840 kB and already warns.

---

## 7. Versioning

This document is **V1.0** and describes the plan as of 2026-10-24. Phase status in section 4
is the source of truth for where the work stands; `TO-DO.md` is the working checklist. When the
shape of the product changes materially, bump the version and note what moved.
