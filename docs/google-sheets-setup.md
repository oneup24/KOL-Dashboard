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
