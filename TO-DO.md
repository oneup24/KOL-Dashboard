# To-Do

> The live checklist. **Do the top block first** — those are the things that are broken or
> blocking right now. Everything below is in priority order.
>
> Map to `MASTER_PLAN_V1.0.md` for what each area is for.
> Last updated: 2026-10-24. Live build: `2201230` (`https://kol-24.netlify.app`).

---

## 🔴 BLOCKING — do these first

### 1. Redeploy the Apps Script as a new version
**Why:** the live script is still the old version. It has no `?action=diagnose`, no
`ensureSetup()`, and the old code still writes rows positionally. **Until this is done the sheet
never receives anything and the auto-seed never runs.**

- [ ] Open https://script.google.com → the `KOL-24` project → `Code.gs`
- [ ] Replace the file contents with the current `scripts/google-sheets.gas` from this repo
      (copy it from the repo — do not hand-edit)
- [ ] Save
- [ ] **Deploy → Manage deployments → Edit → Version: New version → Deploy**
- [ ] Open this URL — it must return a **diagnostics report**, not a data payload:
      ```
      https://script.google.com/macros/s/AKfycbwbNwmzW_oVKav5Jcjyc_Wud2j_RY0zaZatKocmAW34Jwe6M_qCxVbhyv86PQdFctkO/exec?action=diagnose
      ```
      Expected shape: `{"ok":true,"spreadsheet":"KOL-24","tabs":{"Campaigns":{...,"missing":[]}}}`

### 2. Confirm the auto-seed ran
- [ ] Open the dashboard → **Settings**
- [ ] The status card should show the spreadsheet name as a **link** and a last-synced time
- [ ] **Run diagnostics** → every tab should show `rows` > 0 and `missing: []`
- [ ] Open the Sheet → `Campaigns`, `KOLs`, `Applications` tabs should have rows

### 3. Re-create the "TESTING" campaign
**Why:** the original existed only in one browser tab and was never persisted. It is gone and
cannot be recovered.

- [ ] Campaigns → **New Campaign** → recreate it
- [ ] **Share** → copy the **Public link** (`https://kol-24.netlify.app/c/<slug>/`)
- [ ] Open that link in an **Incognito** window → it must render the campaign page, **not** the
      dashboard and **not** a 404
- [ ] Go back to the Sheet → the campaign row should be there

### 4. Set `VITE_DASHBOARD_CODE` in Netlify
**Why:** the dashboard is currently open to anyone with the URL, and it shows every KOL's
WhatsApp number. The access gate is built but not armed.

- [ ] Netlify → **kol-24** → Site configuration → **Environment variables**
- [ ] Add `VITE_DASHBOARD_CODE` = a code only the marketing team knows
- [ ] Trigger a redeploy (push any commit, or Netlify → **Deploys → Redeploy**)
- [ ] Open the dashboard in an Incognito window → it should ask for the code
- [ ] Open a public campaign link in the same Incognito window → it must **not** ask for a code

---

## 🟡 HIGH — the product is usable, but these make it reliable

### 5. Connect the sheet on every device
**Why:** the Sheets URL lives in `localStorage`, so each browser, each device and each Incognito
window needs it pasted once. This is the most likely cause of a write that "silently failed".

- [ ] On each machine the team uses: dashboard → **Settings** → paste the web app URL → **Save**
      → **Test connection**
- [ ] Confirm the header shows **Sheet synced** (not "Sync failed", not "not connected")

### 6. Set a Netlify build hook so new campaigns get link previews
**Why:** static preview pages are generated at build time. A campaign created after the last
build has a working URL but no rich preview.

- [ ] Netlify → Site configuration → Build & deploy → **Build hooks** → create a hook
- [ ] Dashboard → **Settings → Link previews** → paste the hook URL → **Save & trigger rebuild**
- [ ] Test: create a throwaway campaign, wait ~1 minute, then open its `/c/<slug>/` link in
      Messenger — it should show the product image

### 7. Decide the fee model per campaign
**Why:** the fee model is configurable but has never been set to a real value, and the default
("gift") is hidden from KOLs.

- [ ] For each live campaign: Campaigns → edit → **Money** → set the model and the wording
- [ ] Leave **Show the fee details to KOLs** off for pure gifting campaigns
- [ ] Turn it on only where there is a real fee, and write the wording you want KOLs to read

### 8. Decide the promo code value
**Why:** `promoCodeValue` is owner-written and currently empty, so approved KOLs are not told
what the code is worth.

- [ ] For each live campaign: edit → **Money → Promo code** → set the pattern and the value
- [ ] Decide per campaign: `%` off, fixed amount off, or attribution only

---

## 🟢 NEXT FEATURES — pick in this order

### 9. Targeting actually works — Phase 7
`platforms`, `kolTiers`, `audience`, `language` are captured but never read.

- [ ] Filter the applications inbox by tier and platform
- [ ] Flag applicants who miss the campaign's audience brief
- [ ] Show a fit score per application

### 10. Real auth on the dashboard — Phase 6, second half
The access code is a speed bump; it lives in the shipped JavaScript.

- [ ] Netlify password protection (paid) **or** Cloudflare Access (free, 50 users)
- [ ] Decide whether the Google Sheet itself needs tighter sharing than "Anyone with the link"

### 11. Server-side public application write — Phase 8
Today a KOL's application only reaches the sheet because the marketer's browser pushes it.

- [ ] Netlify Function holding the Sheets URL server-side
- [ ] The public form POSTs to the function instead of the script
- [ ] A KOL's application lands in the sheet without the marketer doing anything

### 12. Actual message sending — Phase 8
Templates render and copy correctly; sending is still manual.

- [ ] WhatsApp Business API, or a Facebook Page for Messenger
- [ ] Log the send against the application automatically

### 13. The report the boss gets — Phase 9
- [ ] A report view: campaign performance, delivery against target, spend, attributed revenue
- [ ] One click → paste-ready Google Sheet block
- [ ] Track promo-code redemptions so revenue attributes to a KOL

### 14. Metrics capture — Phase 8
- [ ] Instagram Graph API and TikTok API tokens
- [ ] Pull reach, views, likes, comments instead of typing them

### 15. Close the dead buttons
Deliberately left non-functional rather than faked. Either wire them or remove them:

- [ ] Sidebar → **Watchlist** (tag KOLs, batch-invite)
- [ ] Sidebar → **Export Data**
- [ ] Reports → **Last 30 Days** (a real date range)
- [ ] Campaign form → **More Filters** (date range, region, manager)

---

## 🧹 HOUSEKEEPING

- [ ] `RULES.md` line 6 still says *"No backend yet. The data layer is in-memory"* — stale since
      Phase 4. Update it.
- [ ] `PROJECT_BRIEF.md` line 24 says the 404 page *"bounces to the app"* — it is now a terminal
      branded page. Update it.
- [ ] `PROJECT_BRIEF.md` lists two known constraints; the first (the public form cannot reach
      the sheet) is what Phase 8 fixes. Update once Phase 8 lands.
- [ ] Bundle is ~840 kB and Vite warns above 500 kB. Known and accepted, but worth a code-split
      pass if it grows further.
- [ ] The Google Sheets URL in a public JS bundle is effectively a password. If the Sheet ever
      holds more sensitive data than KOL contact details, revisit Phase 8's server-side function.

---

## HOW TO PUBLISH

```bash
cd /Users/user/KOL-Dashboard
bash scripts/publish.sh
```

It runs the type-check and build, commits, pushes, watches the deploy, then verifies that both
hosts actually serve the new bundle. It refuses to force-push, hard-reset, rebase, merge, tag
or amend. To control the commit message, put it in `.release-message` at the repo root first.
