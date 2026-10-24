import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  checkHealth,
  deleteRecord,
  diagnoseSheet,
  readSnapshot,
  SheetsError,
  triggerBuildHook,
  upsertRecord,
  type SheetsEntity,
  type SheetsSnapshot,
  type SheetDiagnostics,
} from "@/services/sheetsApi";

export type { SheetDiagnostics } from "@/services/sheetsApi";

const URL_KEY = "fx.kol.sheetsUrl";
const HOOK_KEY = "fx.kol.buildHookUrl";

export type SyncStatus = "disabled" | "idle" | "loading" | "syncing" | "ok" | "error";

/**
 * The outcome of the last write to the sheet. The UI shows this so a failed
 * write is visible instead of silent — the marketer used to have no way of
 * telling that a campaign never reached the sheet.
 */
export interface SheetWriteRecord {
  /** The collection that was written to ("campaigns", "kols", …). */
  entity: string;
  /** The id of the written record, when the write was for a single row. */
  id?: string | number;
  /** Whether the write reached the sheet. */
  ok: boolean;
  /** Why the write failed — the human-readable reason plus the hint. */
  error?: string;
  /** ISO timestamp of the attempt. */
  at: string;
}

export interface SheetsContextValue {
  url: string;
  setUrl: (url: string) => void;
  buildHookUrl: string;
  setBuildHookUrl: (url: string) => void;
  enabled: boolean;
  status: SyncStatus;
  lastSyncedAt?: string;
  error?: string;
  errorHint?: string;
  snapshot?: SheetsSnapshot;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  /** The outcome of the last write — undefined until something is written. */
  lastWrite?: SheetWriteRecord;
  /** True when the sheet loaded and holds no records at all. */
  sheetIsEmpty?: boolean;
  /** Bumped every time the marketer points the dashboard at another sheet. */
  connectionId: number;
  refresh: () => Promise<void>;
  testConnection: () => Promise<void>;
  /** Asks the web app for a per-tab report of the sheet. */
  diagnose: () => Promise<SheetDiagnostics>;
  push: (entity: SheetsEntity, record: unknown) => void;
  pushAll: (entity: SheetsEntity, records: unknown[]) => void;
  remove: (entity: SheetsEntity, id: string | number) => void;
  triggerBuild: () => void;
}

const SheetsContext = createContext<SheetsContextValue | null>(null);

const readStored = (key: string): string => {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

const writeStored = (key: string, value: string) => {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable — the app still works in-memory */
  }
};

/**
 * A failure the UI can show as-is: the human-readable reason plus the hint
 * from SheetsError, which explains what to do about it.
 */
const describeError = (err: unknown, fallback: string): string => {
  const message = err instanceof Error && err.message ? err.message : fallback;
  const hint = err instanceof SheetsError ? err.hint : "";
  return hint ? `${message} — ${hint}` : message;
};

/** The id of a record being written, when it has one. */
const recordId = (record: unknown): string | number | undefined => {
  if (!record || typeof record !== "object") return undefined;
  const id = (record as { id?: unknown }).id;
  if (typeof id === "string" || typeof id === "number") return id;
  return undefined;
};

export const SheetsProvider = ({ children }: { children: ReactNode }) => {
  const [url, setUrlState] = useState<string>(() => readStored(URL_KEY));
  const [buildHookUrl, setBuildHookUrlState] = useState<string>(() => readStored(HOOK_KEY));
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [errorHint, setErrorHint] = useState<string | undefined>(undefined);
  const [snapshot, setSnapshot] = useState<SheetsSnapshot | undefined>(undefined);
  const [spreadsheetName, setSpreadsheetName] = useState<string | undefined>(undefined);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | undefined>(undefined);
  const [lastWrite, setLastWrite] = useState<SheetWriteRecord | undefined>(undefined);
  const [connectionId, setConnectionId] = useState<number>(0);

  const urlRef = useRef(url);
  urlRef.current = url;

  // The URL the current connection was opened with. Only setUrl() moves it,
  // so the initial load never counts as a new connection.
  const connectionUrlRef = useRef(url);

  const setUrl = useCallback((next: string) => {
    const trimmed = next.trim();
    writeStored(URL_KEY, trimmed);
    setUrlState(trimmed);
    setSnapshot(undefined);
    setStatus(trimmed ? "idle" : "disabled");
    setError(undefined);
    setErrorHint(undefined);
    // Pointing the dashboard at another sheet is a new connection — the UI
    // re-runs its auto-seeding when this changes. Saving the same URL again
    // is not a new connection.
    if (trimmed !== connectionUrlRef.current) {
      connectionUrlRef.current = trimmed;
      setConnectionId((prev) => prev + 1);
    }
  }, []);

  const setBuildHookUrl = useCallback((next: string) => {
    const trimmed = next.trim();
    writeStored(HOOK_KEY, trimmed);
    setBuildHookUrlState(trimmed);
  }, []);

  const enabled = url.trim().length > 0;

  const refresh = useCallback(async () => {
    const target = urlRef.current.trim();
    if (!target) return;
    setStatus("loading");
    setError(undefined);
    setErrorHint(undefined);
    try {
      const data = await readSnapshot(target);
      setSnapshot(data);
      setLastSyncedAt(new Date().toISOString());
      setStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.");
      setErrorHint(err instanceof SheetsError ? err.hint : undefined);
      setStatus("error");
    }
  }, []);

  const testConnection = useCallback(async () => {
    const target = urlRef.current.trim();
    if (!target) return;
    setStatus("loading");
    setError(undefined);
    setErrorHint(undefined);
    try {
      const info = await checkHealth(target);
      setSpreadsheetName(info.spreadsheet);
      setSpreadsheetUrl(info.spreadsheetUrl || undefined);
      const data = await readSnapshot(target);
      setSnapshot(data);
      setLastSyncedAt(new Date().toISOString());
      setStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection test failed.");
      setErrorHint(err instanceof SheetsError ? err.hint : undefined);
      setStatus("error");
    }
  }, []);

  /**
   * Asks the web app for a per-tab report of the sheet.
   *
   * On success the report is returned and `status` becomes "ok". On failure
   * the context is put into the error state (`error` + `errorHint`) AND the
   * promise rejects, so a caller can tell the two apart without reading the
   * status. Callers that only care about the context state should swallow
   * the rejection: `void diagnose().catch(() => {})`.
   */
  const diagnose = useCallback(async (): Promise<SheetDiagnostics> => {
    const target = urlRef.current.trim();
    if (!target) {
      const message = "No web app URL configured.";
      setError(message);
      setErrorHint(undefined);
      setStatus("error");
      throw new SheetsError(
        message,
        "Paste the Apps Script web app URL into Settings > Google Sheets first.",
      );
    }
    setStatus("loading");
    setError(undefined);
    setErrorHint(undefined);
    try {
      const report = await diagnoseSheet(target);
      setSpreadsheetName(report.spreadsheet);
      setSpreadsheetUrl(report.spreadsheetUrl || undefined);
      setLastSyncedAt(new Date().toISOString());
      setStatus("ok");
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Diagnostics failed.");
      setErrorHint(err instanceof SheetsError ? err.hint : undefined);
      setStatus("error");
      throw err;
    }
  }, []);

  /**
   * True once a snapshot has loaded and every collection in it is empty.
   * Undefined until the first snapshot arrives (and after the URL changes,
   * while the new sheet is loading) — the UI uses this to decide whether to
   * auto-seed.
   */
  const sheetIsEmpty = useMemo(() => {
    if (!snapshot) return undefined;
    return (
      snapshot.campaigns.length === 0 &&
      snapshot.kols.length === 0 &&
      snapshot.applications.length === 0 &&
      snapshot.messageLog.length === 0
    );
  }, [snapshot]);

  // Initial load once a URL is configured.
  useEffect(() => {
    if (!enabled) {
      setStatus("disabled");
      return;
    }
    void refresh();
  }, [enabled, refresh]);

  const push = useCallback((entity: SheetsEntity, record: unknown) => {
    const target = urlRef.current.trim();
    if (!target) return;
    const id = recordId(record);
    setStatus("syncing");
    void upsertRecord(target, entity, record)
      .then(() => {
        setLastSyncedAt(new Date().toISOString());
        setStatus("ok");
        setError(undefined);
        setErrorHint(undefined);
        setLastWrite({ entity, id, ok: true, at: new Date().toISOString() });
      })
      .catch((err: unknown) => {
        const message = describeError(err, "Write failed.");
        setError(err instanceof Error ? err.message : "Write failed.");
        setErrorHint(err instanceof SheetsError ? err.hint : undefined);
        setStatus("error");
        setLastWrite({ entity, id, ok: false, error: message, at: new Date().toISOString() });
      });
  }, []);

  const pushAll = useCallback((entity: SheetsEntity, records: unknown[]) => {
    const target = urlRef.current.trim();
    if (!target || records.length === 0) return;
    setStatus("syncing");
    void (async () => {
      for (const record of records) {
        await upsertRecord(target, entity, record);
      }
    })()
      .then(() => {
        setLastSyncedAt(new Date().toISOString());
        setStatus("ok");
        setError(undefined);
        setErrorHint(undefined);
        setLastWrite({ entity, ok: true, at: new Date().toISOString() });
      })
      .catch((err: unknown) => {
        const message = describeError(err, "Bulk write failed.");
        setError(err instanceof Error ? err.message : "Bulk write failed.");
        setErrorHint(err instanceof SheetsError ? err.hint : undefined);
        setStatus("error");
        setLastWrite({ entity, ok: false, error: message, at: new Date().toISOString() });
      });
  }, []);

  const remove = useCallback((entity: SheetsEntity, id: string | number) => {
    const target = urlRef.current.trim();
    if (!target) return;
    setStatus("syncing");
    void deleteRecord(target, entity, id)
      .then(() => {
        setLastSyncedAt(new Date().toISOString());
        setStatus("ok");
        setLastWrite({ entity, id, ok: true, at: new Date().toISOString() });
      })
      .catch((err: unknown) => {
        const message = describeError(err, "Delete failed.");
        setError(err instanceof Error ? err.message : "Delete failed.");
        setErrorHint(err instanceof SheetsError ? err.hint : undefined);
        setStatus("error");
        setLastWrite({ entity, id, ok: false, error: message, at: new Date().toISOString() });
      });
  }, []);

  const triggerBuild = useCallback(() => {
    const hook = buildHookUrl.trim();
    if (!hook) return;
    void triggerBuildHook(hook);
  }, [buildHookUrl]);

  const value = useMemo(
    () => ({
      url,
      setUrl,
      buildHookUrl,
      setBuildHookUrl,
      enabled,
      status,
      lastSyncedAt,
      error,
      errorHint,
      snapshot,
      spreadsheetName,
      spreadsheetUrl,
      lastWrite,
      sheetIsEmpty,
      connectionId,
      refresh,
      testConnection,
      diagnose,
      push,
      pushAll,
      remove,
      triggerBuild,
    }),
    [
      url,
      setUrl,
      buildHookUrl,
      setBuildHookUrl,
      enabled,
      status,
      lastSyncedAt,
      error,
      errorHint,
      snapshot,
      spreadsheetName,
      spreadsheetUrl,
      lastWrite,
      sheetIsEmpty,
      connectionId,
      refresh,
      testConnection,
      diagnose,
      push,
      pushAll,
      remove,
      triggerBuild,
    ],
  );

  return <SheetsContext.Provider value={value}>{children}</SheetsContext.Provider>;
};

export const useSheets = (): SheetsContextValue => {
  const ctx = useContext(SheetsContext);
  if (!ctx) throw new Error("useSheets must be used within a SheetsProvider");
  return ctx;
};
