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
  "Could not reach the Google Apps Script web app. Most likely one of: the script has not been " +
  "deployed as a Web app yet (Deploy > New deployment > Web app), the deployment access is " +
  "\u201cAnyone with Google account\u201d instead of \u201cAnyone\u201d, or you pasted the script " +
  "editor URL (/macros/library/\u2026) rather than the web app URL (/macros/s/\u2026/exec).";

/**
 * Apps Script answers a request it cannot serve with a redirect to the Google
 * sign-in page when the deployment access is restricted. Detect that so the
 * error tells the truth instead of blaming CORS.
 */
const isSignInRedirect = (res: Response): boolean => {
  const url = res.url ?? "";
  return url.includes("accounts.google.com") || url.includes("ServiceLogin");
};

export interface SheetsHealth {
  spreadsheet: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  tabs: string[];
}

export const checkHealth = async (url: string): Promise<SheetsHealth> => {
  let res: Response;
  try {
    res = await request(`${url}?action=health`);
  } catch {
    throw new SheetsError("Could not reach the web app.", networkHint);
  }
  if (isSignInRedirect(res)) {
    throw new SheetsError(
      "The web app asked us to sign in.",
      "The deployment access is restricted. Open Deploy > Manage deployments > Edit and set " +
        "\u201cWho has access\u201d to \u201cAnyone\u201d, then choose a new version.",
    );
  }
  if (res.status === 404) {
    throw new SheetsError(
      "The web app has not been deployed yet.",
      "Open the Apps Script editor > Deploy > New deployment > Web app. Execute as \u201cMe\u201d, " +
        "access \u201cAnyone\u201d. Then copy the /macros/s/.../exec URL.",
    );
  }
  const payload = parsePayload(await res.text());
  if (!payload.ok) {
    throw new SheetsError(String(payload.error ?? "Health check failed."), networkHint);
  }
  return {
    spreadsheet: String(payload.spreadsheet ?? ""),
    spreadsheetId: String(payload.spreadsheetId ?? ""),
    spreadsheetUrl: String(payload.spreadsheetUrl ?? ""),
    tabs: (payload.tabs as string[]) ?? [],
  };
};

export const readSnapshot = async (url: string): Promise<SheetsSnapshot> => {
  let res: Response;
  try {
    res = await request(`${url}?action=read`);
  } catch {
    throw new SheetsError("Could not reach the web app.", networkHint);
  }
  if (isSignInRedirect(res)) {
    throw new SheetsError(
      "The web app asked us to sign in.",
      "The deployment access is restricted. Open Deploy > Manage deployments > Edit and set " +
        "“Who has access” to “Anyone”, then choose a new version.",
    );
  }
  if (res.status === 404) {
    throw new SheetsError(
      "The web app has not been deployed yet.",
      "Open the Apps Script editor > Deploy > New deployment > Web app. Execute as “Me”, " +
        "access “Anyone”. Then copy the /macros/s/.../exec URL.",
    );
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
  if (isSignInRedirect(res)) {
    throw new SheetsError(
      "The web app asked us to sign in.",
      "The deployment access is restricted. Open Deploy > Manage deployments > Edit and set " +
        "\u201cWho has access\u201d to \u201cAnyone\u201d, then choose a new version.",
    );
  }
  if (res.status === 404) {
    throw new SheetsError(
      "The web app has not been deployed yet.",
      "Open the Apps Script editor > Deploy > New deployment > Web app. Execute as \u201cMe\u201d, " +
        "access \u201cAnyone\u201d. Then copy the /macros/s/.../exec URL.",
    );
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
