/**
 * Offline harness for the Apps Script backend.
 *
 * Stubs the Apps Script APIs, then exercises the real functions from
 * scripts/google-sheets.gas against:
 *   A) a fresh sheet
 *   B) a Campaigns tab that already holds data under the OLD (pre-fix)
 *      header — the migration case that must not corrupt existing rows
 *   C) an EMPTY Campaigns tab with the old header — should get a clean one
 *
 * Run with: node scripts/test-sheets.gas.test.mjs
 */
import fs from "node:fs";
import vm from "node:vm";

/* ── fake Sheets API ────────────────────────────────────────────────────── */

class FakeRange {
  constructor(sheet, row, col, numRows, numCols) {
    this.sheet = sheet;
    this.row = row;
    this.col = col;
    this.numRows = numRows;
    this.numCols = numCols;
  }
  getValues() {
    const out = [];
    for (let r = 0; r < this.numRows; r++) {
      const row = [];
      for (let c = 0; c < this.numCols; c++) row.push(this.sheet.cell(this.row + r, this.col + c));
      out.push(row);
    }
    return out;
  }
  setValues(values) {
    values.forEach((row, r) => {
      row.forEach((value, c) => this.sheet.setCell(this.row + r, this.col + c, value));
    });
    return this;
  }
}

class FakeSheet {
  constructor(name, maxColumns = 30) {
    this.name = name;
    this.grid = new Map();
    this.maxColumns = maxColumns;
    this.frozen = 0;
  }
  cell(r, c) {
    const v = this.grid.get(`${r},${c}`);
    return v === undefined ? "" : v;
  }
  setCell(r, c, v) {
    this.grid.set(`${r},${c}`, v);
  }
  getRange(row, col, numRows = 1, numCols = 1) {
    return new FakeRange(this, row, col, numRows, numCols);
  }
  getLastRow() {
    let max = 0;
    for (const k of this.grid.keys()) max = Math.max(max, Number(k.split(",")[0]));
    return max;
  }
  getLastColumn() {
    let max = 0;
    for (const k of this.grid.keys()) max = Math.max(max, Number(k.split(",")[1]));
    return max;
  }
  getMaxColumns() {
    return Math.max(this.maxColumns, this.getLastColumn());
  }
  setFrozenRows(n) {
    this.frozen = n;
  }
  insertColumnsAfter(after, howMany) {
    const next = new Map();
    for (const [k, v] of this.grid.entries()) {
      const [r, c] = k.split(",").map(Number);
      next.set(`${r},${c > after ? c + howMany : c}`, v);
    }
    this.grid = next;
    this.maxColumns += howMany;
  }
  deleteRow(row) {
    const next = new Map();
    for (const [k, v] of this.grid.entries()) {
      const [r, c] = k.split(",").map(Number);
      if (r === row) continue;
      next.set(`${r > row ? r - 1 : r},${c}`, v);
    }
    this.grid = next;
  }
  dump() {
    const rows = [];
    for (let r = 1; r <= this.getLastRow(); r++) {
      const line = [];
      for (let c = 1; c <= this.getMaxColumns(); c++) line.push(this.cell(r, c));
      rows.push(line);
    }
    return rows;
  }
}

class FakeSpreadsheet {
  constructor(name) {
    this.name = name;
    this.id = "FAKE_ID";
    this.sheets = [];
  }
  getName() {
    return this.name;
  }
  getId() {
    return this.id;
  }
  getUrl() {
    return "https://docs.google.com/spreadsheets/d/FAKE_ID/edit";
  }
  getSheetByName(n) {
    return this.sheets.find((s) => s.name === n);
  }
  insertSheet(n) {
    const s = new FakeSheet(n);
    this.sheets.push(s);
    return s;
  }
}

/* ── stub globals ──────────────────────────────────────────────────────── */

const activeSheet = new FakeSpreadsheet("KOL-24");
let props = {};

const sandbox = {
  SpreadsheetApp: {
    getActiveSpreadsheet: () => activeSheet,
    openById: () => activeSheet,
    create: (name) => {
      const s = new FakeSpreadsheet(name);
      activeSheet.sheets = s.sheets;
      return s;
    },
  },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (k) => props[k] ?? null,
      setProperty: (k, v) => {
        props[k] = v;
      },
    }),
  },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput: (text) => ({
      text,
      setMimeType() {
        return this;
      },
    }),
  },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  console,
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("scripts/google-sheets.gas", "utf8"), sandbox);
// Top-level `const` lives in the VM lexical scope, not on the sandbox object.
const TABS = vm.runInContext("TABS", sandbox);
const call = (name, ...args) => vm.runInContext(name, sandbox)(...args);
const headerOf = (sheet) => sandbox.headerOf(sheet);

let failures = 0;
const check = (label, ok) => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}`);
};

/* The exact header the previous deployment wrote — duplicated fee columns
   included, and no feeDisplay* / promoCode* columns. */
const OLD_HEADER = [
  "id", "slug", "name", "status", "platform", "region", "manager",
  "budget", "totalBudget", "feeModel", "feePerKol", "commissionPct",
  "targetKolCount", "maxApplications", "campaignCode",
  "applicationDeadline", "postStartDate", "postEndDate", "endDate",
  "progress", "kols",
  "productName", "productUrl", "productImage", "productDescription",
  "campaignBrief", "disclosureText", "briefDocUrl", "language",
  "feeModel", "feePerKol", "commissionPct", "totalBudget",
  "updatedAt",
  "platforms", "deliverables", "requirements", "mandatoryTags",
  "mandatoryMentions", "audience", "variants", "storeIds", "kolTiers",
  "customQuestions", "extra",
];

const NEW_CAMPAIGN = {
  id: 42,
  slug: "q4-brand-awareness",
  name: "Q4 Brand Awareness",
  status: "Active",
  platform: "Instagram",
  platforms: ["Instagram"],
  region: "HK",
  manager: "Jason Lee",
  budget: "$18,500",
  totalBudget: 18500,
  targetKolCount: 8,
  maxApplications: 50,
  campaignCode: "Q4B",
  applicationDeadline: "2026-10-20",
  postStartDate: "2026-11-01",
  postEndDate: "2026-12-10",
  endDate: "2026-12-10",
  progress: 42,
  kols: 8,
  productName: "AGS Series",
  productUrl: "https://x",
  productImage: "https://y",
  productDescription: "d",
  campaignBrief: "b",
  disclosureText: "#廣告 Advertisement",
  briefDocUrl: "",
  language: "en-HK",
  feeModel: "commission",
  feePerKol: 0,
  commissionPct: 10,
  feeDisplayEnabled: true,
  feeDisplayText: "10% commission on every sale",
  promoCodeTemplate: "FX-{campaign}-{kol}",
  promoCodeValue: "10% commission on every sale",
  updatedAt: "2026-10-24T00:00:00Z",
  deliverables: [{ platform: "Instagram", type: "Reel", count: 3 }],
  requirements: ["Tag us"],
  mandatoryTags: ["#AGSLife"],
  mandatoryMentions: ["@fxcreations"],
  audience: { ageRange: "18-34", genderSplit: "70% F", interests: [], region: "HK" },
  variants: [],
  storeIds: ["cwb"],
  kolTiers: ["Micro"],
  customQuestions: [],
  brandNewField: "kept anyway",
};

/* ── A. fresh sheet ────────────────────────────────────────────────────── */

console.log("=== A. fresh sheet ===");
props = {};
console.log("setup:", call("setup"));
Object.keys(TABS).forEach((name) => {
  const sheet = activeSheet.getSheetByName(TABS[name]);
  console.log("  " + String(TABS[name]).padEnd(14) + " header cols = " + sheet.getLastColumn());
});

call("upsert", "kols", {
  id: 1,
  name: "Elena H.",
  handle: "elena_styles",
  primaryPlatform: "Instagram",
  followers: 120000,
  er: 5.2,
  whatsapp: "+852 9123 4567",
  email: "elena@example.com",
  platforms: ["Instagram"],
  niches: ["Fashion"],
  tags: [],
  posts: [],
  region: "HK",
  tier: "Micro",
  rateCard: "$1,200",
  source: "inbound",
  status: "active",
  rating: 98,
  dateAdded: "2026-10-24T00:00:00Z",
  avatar: "x",
});
const kolsA = call("readEntity", "kols");
check("KOL round-trips", kolsA.length === 1 && kolsA[0].handle === "elena_styles");
check("array field survives", JSON.stringify(kolsA[0].platforms) === '["Instagram"]');
check("empty array survives", JSON.stringify(kolsA[0].niches) === '["Fashion"]');

/* ── B. tab with existing data under the old header ───────────────────── */

console.log("");
console.log("=== B. Campaigns tab with existing data under the old header ===");
props = { SPREADSHEET_ID: "FAKE_ID" };
const old = new FakeSpreadsheet("KOL-24");
old.sheets = [];
const campSheet = new FakeSheet("Campaigns");
old.sheets.push(campSheet);
campSheet.getRange(1, 1, 1, OLD_HEADER.length).setValues([OLD_HEADER]);

const existingRow = {
  id: "9",
  slug: "old-campaign",
  name: "Existing Campaign",
  status: "Active",
  platform: "Instagram",
  feeModel: "gift",
  productName: "Old Product",
  updatedAt: "2026-01-01T00:00:00Z",
};
OLD_HEADER.forEach((h, i) => {
  if (existingRow[h] !== undefined) campSheet.setCell(2, i + 1, existingRow[h]);
});

sandbox.SpreadsheetApp.getActiveSpreadsheet = () => old;
sandbox.SpreadsheetApp.openById = () => old;

const beforeRow = campSheet.dump()[1].slice(0, OLD_HEADER.length);
console.log("  before — header cols:", campSheet.getLastColumn());
console.log("  before — existing row:", JSON.stringify(beforeRow.slice(0, 12)));

call("setup");
const newHeader = headerOf(campSheet);
console.log("  after  — header cols:", campSheet.getLastColumn());
console.log("  appended:", newHeader.filter((h) => OLD_HEADER.indexOf(h) === -1).join(", "));

const afterRow = campSheet.dump()[1];
check(
  "existing row byte-identical",
  JSON.stringify(beforeRow) === JSON.stringify(afterRow.slice(0, OLD_HEADER.length)),
);
check(
  "existing row still readable by name",
  afterRow[newHeader.indexOf("id")] === "9" &&
    afterRow[newHeader.indexOf("name")] === "Existing Campaign" &&
    afterRow[newHeader.indexOf("slug")] === "old-campaign",
);

call("upsert", "campaigns", NEW_CAMPAIGN);
const rowsB = call("readEntity", "campaigns");
const newRow = rowsB.find((r) => String(r.id) === "42");
const oldRow = rowsB.find((r) => String(r.id) === "9");
check("new row written and read back", Boolean(newRow));
check("old row still readable", oldRow && oldRow.name === "Existing Campaign");
check("feeDisplayEnabled survives", newRow?.feeDisplayEnabled === true);
check("feeDisplayText survives", newRow?.feeDisplayText === "10% commission on every sale");
check("promoCodeTemplate survives", newRow?.promoCodeTemplate === "FX-{campaign}-{kol}");
check("promoCodeValue survives", newRow?.promoCodeValue === "10% commission on every sale");
check("deliverables survive", Array.isArray(newRow?.deliverables) && newRow.deliverables[0].count === 3);
check("unknown field kept in 'extra'", newRow?.brandNewField === "kept anyway");

/* ── C. empty tab with the old header ──────────────────────────────────── */

console.log("");
console.log("=== C. empty Campaigns tab with the old (duplicated) header ===");
const emptyBook = new FakeSpreadsheet("Empty Book");
const emptySheet = new FakeSheet("Campaigns");
emptyBook.sheets = [emptySheet];
emptySheet.getRange(1, 1, 1, OLD_HEADER.length).setValues([OLD_HEADER]);
sandbox.SpreadsheetApp.getActiveSpreadsheet = () => emptyBook;
sandbox.SpreadsheetApp.openById = () => emptyBook;
const dupesBefore = OLD_HEADER.filter((h, i) => OLD_HEADER.indexOf(h) !== i);
console.log("  duplicates before setup:", dupesBefore.join(", "));
call("setup");
const clean = headerOf(emptySheet);
const dupesAfter = clean.filter((h, i) => clean.indexOf(h) !== i);
console.log("  duplicates after setup:", dupesAfter.length ? dupesAfter.join(", ") : "none");
check("clean header applied", dupesAfter.length === 0);
check("new columns present", ["feeDisplayEnabled", "feeDisplayText", "promoCodeTemplate", "promoCodeValue"].every((c) => clean.includes(c)));

/* ── D. boolean round-trip, both ways ──────────────────────────────────── */

console.log("");
console.log("=== D. feeDisplayEnabled=false must NOT come back truthy ===");
sandbox.SpreadsheetApp.getActiveSpreadsheet = () => old;
sandbox.SpreadsheetApp.openById = () => old;
call("upsert", "campaigns", Object.assign({}, NEW_CAMPAIGN, {
  id: 43,
  slug: "gifting-campaign",
  name: "Gifting Campaign",
  feeDisplayEnabled: false,
  feeDisplayText: "",
  promoCodeTemplate: "GIFT10",
  promoCodeValue: "10% off for your audience",
}));
const rowsD = call("readEntity", "campaigns");
const giftRow = rowsD.find((r) => String(r.id) === "43");
console.log("  raw value:", JSON.stringify(giftRow?.feeDisplayEnabled), "(type " + typeof giftRow?.feeDisplayEnabled + ")");
check("false stays a real boolean false", giftRow?.feeDisplayEnabled === false);
check("false is falsy in a condition", !giftRow?.feeDisplayEnabled);
const row42 = rowsD.find((r) => String(r.id) === "42");
check("row 42 still present after a further write", Boolean(row42));
check("true is a real boolean true", row42?.feeDisplayEnabled === true);
check("shared promo template round-trips", giftRow?.promoCodeTemplate === "GIFT10");
check("paid boolean on applications", (() => {
  call("upsert", "applications", {
    id: "APP-1", campaignId: 42, kolId: 1, status: "Approved",
    appliedAt: "2026-10-24T00:00:00Z", updatedAt: "2026-10-24T00:00:00Z",
    pickupStoreId: "cwb", paid: false,
  });
  const app = call("readEntity", "applications")[0];
  return app.paid === false;
})());

console.log("");
console.log(failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED");
process.exit(failures === 0 ? 0 : 1);
