# Google Sheets setup

The dashboard can run entirely on its own (everything in memory, lost on refresh), or it can
persist to a Google Sheet. This guide sets up the Sheet.

---

## 1. Create the Sheet

1. Go to <https://sheets.new> and name it something like **FX Creations — KOL Dashboard**.
2. Note the spreadsheet id — it is the long string in the URL between `/d/` and `/edit`:
   `https://docs.google.com/spreadsheets/d/<THIS_PART>/edit`

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**.
2. Delete the placeholder `Code.gs` content and paste the whole of
   [`scripts/google-sheets.gas`](./scripts/google-sheets.gas) from this repo.
3. Click the disk icon to save.

### Point it at your Sheet

**Option A — the script is bound to the Sheet (easiest)**

Because you opened Apps Script *from inside* the Sheet, `getActiveSpreadsheet()` already
resolves to it. Nothing to configure.

**Option B — a standalone script**

If you created the script from `script.google.com` instead, set the id explicitly:

1. **Project Settings** (the gear icon) → **Script Properties** → **Add script property**
2. Property name `SPREADSHEET_ID`, value = your spreadsheet id from step 1.
3. Save.

## 3. Create the tabs

1. In the Apps Script editor, pick the `setup` function from the function dropdown (top-left).
2. Click **Run**. Approve the permission prompt.
3. Check the Logs — it should print `Tabs ready: Campaigns, KOLs, Applications, MessageLog`.
4. Go back to the Sheet: you now have four tabs with header rows.

| Tab | One row per | Key columns |
|---|---|---|
| `Campaigns` | campaign | id, slug, name, status, product, dates, budget |
| `KOLs` | KOL (the CRM master record) | id, name, handle, WhatsApp, email, followers, tier |
| `Applications` | campaign application | id, campaignId, kolId, status, promoCode, postUrl |
| `MessageLog` | message sent | id, applicationId, recipient, channel, sentAt |

Columns that hold a list or an object are stored as JSON text in a single cell so nothing is
lost. Any field the script does not know about is preserved in the trailing `extra` column, so
you can add fields to the app later without dropping data.

## 4. Deploy as a web app

1. **Deploy → New deployment** → type **Web app**.
2. **Execute as:** `Me`
3. **Who has access:** `Anyone` — *not* "Anyone with Google account".
   This is what lets the dashboard reach it without a Google login.
4. **Deploy** and copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfycbXXXXXXXX/exec`

> If the dashboard reports a CORS error, this step is the usual culprit — check that the
> deployment access really is "Anyone", and that you deployed a **new version** after editing
> the script.

## 5. Connect the dashboard

1. Open the dashboard → **Settings** in the sidebar.
2. Paste the Web app URL into **Apps Script web app URL**.
3. **Save**, then **Test connection**.

You should see **Synced** and the spreadsheet name in the status card. The header shows a
"Sheet synced" indicator from now on.

The URL is stored in this browser only (`localStorage`), so each device that uses the
dashboard needs it set once.

---

## What syncs, and when

| Action | What happens |
|---|---|
| Opening the dashboard | The sheet is read **once** and the app starts from it |
| Approving / rejecting / moving an application | That row is written immediately |
| Creating or editing a KOL | That row is written immediately |
| Creating or editing a campaign | That row is written immediately |
| Sending a message | A row is appended to `MessageLog` |
| **Reload from sheet** (Settings) | Re-reads the whole sheet |

Later edits in the dashboard win. Two marketers editing the same row at the same time is
last-write-wins — the sheet is the record, not a multi-user lock.

## Link previews (optional)

For the Messenger / WhatsApp preview to show the product, each campaign needs a static page
with Open Graph tags. Those are generated at build time from
[`campaign-seeds.json`](../campaign-seeds.json), so:

- campaigns in that file get a preview page automatically
- a campaign created later in the dashboard does **not** have one until the site is rebuilt

To close that gap, create a **Netlify build hook**
(*Site configuration → Build & deploy → Build hooks*) and paste its URL into
**Settings → Netlify build hook URL**. Creating a campaign then triggers a rebuild, and the
preview page appears a minute or so later.

Until then, send the **Direct app link** from the Share dialog — it always works, it just
does not show a rich preview.

---

## Campaign settings the owner controls

Two campaign settings are deliberately yours to decide rather than the app's:

### Promo code

Set in **Campaign → Money → Promo code**. The **Code pattern** field decides the code:

| Pattern | Result |
|---|---|
| `FX-{campaign}-{kol}` | a unique code per KOL — `FX-AGS-042`. Use this for attribution and to spot a KOL sharing their code |
| `FXSUMMER20` | one shared code for every KOL in the campaign |
| *(empty)* | no promo code for this campaign |

`{campaign}` becomes the campaign code, `{kol}` the KOL id. The form shows a live preview of
what the code will look like.

**What the code is worth** (e.g. `15% off for your audience`) is also yours — it is what the
KOL is told to put in their caption. Left blank, it falls back to the commission percentage.

The code is issued to a KOL when you approve their application, and the promo code template is
stored per campaign, so two campaigns never collide.

### Fee details

**Campaign → Money → Fee model** picks the commercial model: `Gift (special)`, `Money (flat fee)`,
`Commission`, or `Money + commission`.

But the **Show the fee details to KOLs** toggle is the important one:

- **Off** — nothing about fees, commission or payment appears anywhere on the public campaign
  page. The fee values stay internal, for your own reporting.
- **On** — a "What you will earn" card appears on the public page, showing **What KOLs will see**
  (your own wording, e.g. *"10% commission on every sale made with your code, paid monthly."*),
  and the same wording is included in the brief message sent to approved KOLs.

> **Why the toggle exists.** A campaign with no cash involved should read as pure gifting. If the
> page said "Fee model: Gift", a KOL would reasonably wonder whether they could ask for money
> instead. Leaving the toggle off removes the question entirely. Turn it on only when there is a
> real fee to advertise.

---

## Troubleshooting

**"Could not reach the web app"**
- Confirm the URL ends in `/exec` (not `/dev`).
- Confirm deployment access is **Anyone**.
- Confirm you deployed a **new version** after editing the script.
- Check the Apps Script **Executions** tab for an error.

**The dashboard says "Synced" but the sheet is empty**
- The sheet has to have been seeded first. Run `setup()` once (step 3).
- If the sheet is genuinely empty, the dashboard shows the built-in demo data instead of an
  empty state — that is intentional, so the app is usable before you connect anything.

**"Object has no property 'id'"**
- A row in one of the tabs was edited by hand and the `id` column was cleared. Every record
  needs an id in column A.
