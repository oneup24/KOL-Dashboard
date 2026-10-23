import type { Application, Campaign, Kol, MessageLogEntry } from "@/types";

export type SheetsEntity = "campaigns" | "kols" | "applications" | "messageLog";

export interface SheetsSnapshot {
  campaigns: Campaign[];
  kols: Kol[];
  applications: Application[];
  messageLog: MessageLogEntry[];
}

export class SheetsError extends Error {
  readonly hint: string;
  constructor(message: string, hint: string) {
    super(message);
    this.name = "SheetsError";
    this.hint = hint;
  }
}

const TIMEOUT_MS = 20000;

const request = async (url: string, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Apps Script answers a CORS preflight for `application/json` POSTs with a
 * 405, which kills the write. `text/plain` is a "simple request" so the
 * browser sends it without a preflight and the JSON body arrives verbatim.
 */
const POST_HEADERS = { "Content-Type": "text/plain;charset=utf-8" };

const parsePayload = (raw: string): Record<string, unknown> => {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new SheetsError(
      "The web app did not return JSON.",
      "Check the Web app URL ends with /exec and that the deployment's access is set to “Anyone”.",
    );
  }
};

const networkHint =
  "Could not reach the Google Apps Script web app. If the URL is correct, this is usually a CORS " +
  "block — make sure the deployment access is “Anyone” (not “Anyone with Google account”) and that " +
  "you deployed a new version after editing the script.";

export const checkHealth = async (url: string): Promise<{ spreadsheet: string; tabs: string[] }> => {
  let res: Response;
  try {
    res = await request(`${url}?action=health`);
  } catch {
    throw new SheetsError("Could not reach the web app.", networkHint);
  }
  const payload = parsePayload(await res.text());
  if (!payload.ok) {
    throw new SheetsError(String(payload.error ?? "Health check failed."), networkHint);
  }
  return { spreadsheet: String(payload.spreadsheet ?? ""), tabs: (payload.tabs as string[]) ?? [] };
};

export const readSnapshot = async (url: string): Promise<SheetsSnapshot> => {
  let res: Response;
  try {
    res = await request(`${url}?action=read`);
  } catch {
    throw new SheetsError("Could not reach the web app.", networkHint);
  }
  const payload = parsePayload(await res.text());
  if (!payload.ok) {
    throw new SheetsError(String(payload.error ?? "Read failed."), networkHint);
  }
  const data = (payload.data ?? {}) as Partial<SheetsSnapshot>;
  return {
    campaigns: data.campaigns ?? [],
    kols: data.kols ?? [],
    applications: data.applications ?? [],
    messageLog: data.messageLog ?? [],
  };
};

export const upsertRecord = async (
  url: string,
  entity: SheetsEntity,
  record: unknown,
): Promise<void> => {
  let res: Response;
  try {
    res = await request(url, {
      method: "POST",
      headers: POST_HEADERS,
      body: JSON.stringify({ action: "upsert", entity, record }),
    });
  } catch {
    throw new SheetsError("Could not reach the web app.", networkHint);
  }
  const payload = parsePayload(await res.text());
  if (!payload.ok) {
    throw new SheetsError(String(payload.error ?? "Write failed."), networkHint);
  }
};

export const deleteRecord = async (
  url: string,
  entity: SheetsEntity,
  id: string | number,
): Promise<void> => {
  let res: Response;
  try {
    res = await request(url, {
      method: "POST",
      headers: POST_HEADERS,
      body: JSON.stringify({ action: "delete", entity, id }),
    });
  } catch {
    throw new SheetsError("Could not reach the web app.", networkHint);
  }
  const payload = parsePayload(await res.text());
  if (!payload.ok) {
    throw new SheetsError(String(payload.error ?? "Delete failed."), networkHint);
  }
};

/**
 * Fires a Netlify build hook so the static link-preview pages are regenerated
 * (e.g. after a new campaign is created). Fire-and-forget — a failure here
 * never blocks the user's action.
 */
export const triggerBuildHook = async (hookUrl: string): Promise<boolean> => {
  try {
    const res = await fetch(hookUrl, { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
};
