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
  readSnapshot,
  SheetsError,
  triggerBuildHook,
  upsertRecord,
  type SheetsEntity,
  type SheetsSnapshot,
} from "@/services/sheetsApi";

const URL_KEY = "fx.kol.sheetsUrl";
const HOOK_KEY = "fx.kol.buildHookUrl";

export type SyncStatus = "disabled" | "idle" | "loading" | "syncing" | "ok" | "error";

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
  refresh: () => Promise<void>;
  testConnection: () => Promise<void>;
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

export const SheetsProvider = ({ children }: { children: ReactNode }) => {
  const [url, setUrlState] = useState<string>(() => readStored(URL_KEY));
  const [buildHookUrl, setBuildHookUrlState] = useState<string>(() => readStored(HOOK_KEY));
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [errorHint, setErrorHint] = useState<string | undefined>(undefined);
  const [snapshot, setSnapshot] = useState<SheetsSnapshot | undefined>(undefined);
  const [spreadsheetName, setSpreadsheetName] = useState<string | undefined>(undefined);

  const urlRef = useRef(url);
  urlRef.current = url;

  const setUrl = useCallback((next: string) => {
    const trimmed = next.trim();
    writeStored(URL_KEY, trimmed);
    setUrlState(trimmed);
    setSnapshot(undefined);
    setStatus(trimmed ? "idle" : "disabled");
    setError(undefined);
    setErrorHint(undefined);
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
    setStatus("syncing");
    void upsertRecord(target, entity, record)
      .then(() => {
        setLastSyncedAt(new Date().toISOString());
        setStatus("ok");
        setError(undefined);
        setErrorHint(undefined);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Write failed.");
        setErrorHint(err instanceof SheetsError ? err.hint : undefined);
        setStatus("error");
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
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Bulk write failed.");
        setErrorHint(err instanceof SheetsError ? err.hint : undefined);
        setStatus("error");
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
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Delete failed.");
        setErrorHint(err instanceof SheetsError ? err.hint : undefined);
        setStatus("error");
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
      refresh,
      testConnection,
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
      refresh,
      testConnection,
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
