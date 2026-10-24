import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Outlet } from "react-router-dom";
import { AlertCircle, KeyRound, Lock } from "lucide-react";
import { dashboardCode } from "@/components/layout/dashboardAccess";

const STORAGE_KEY = "fx.kol.dashboardUnlocked";

interface UnlockRecord {
  /** Length of the code that unlocked the dashboard. */
  len: number;
  /** A simple hash of that code — the code itself is never stored. */
  hash: number;
}

/**
 * FNV-1a. A cheap, non-cryptographic hash: it keeps the access code out of
 * localStorage and out of the comparison, which is all it is for.
 */
const fingerprint = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/** Compares two hashes without bailing out on the first difference. */
const sameFingerprint = (a: number, b: number): boolean => {
  let diff = (a ^ b) >>> 0;
  diff |= diff >>> 16;
  diff |= diff >>> 8;
  diff |= diff >>> 4;
  diff |= diff >>> 2;
  diff |= diff >>> 1;
  return diff === 0;
};

const readUnlock = (): UnlockRecord | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UnlockRecord>;
    if (typeof parsed?.len !== "number" || typeof parsed?.hash !== "number") return null;
    return { len: parsed.len, hash: parsed.hash };
  } catch {
    return null;
  }
};

const writeUnlock = (record: UnlockRecord | null) => {
  try {
    if (record) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — the code is asked for again next time */
  }
};

/** The record that proves the browser has already been unlocked. */
const unlockRecord = (code: string): UnlockRecord => ({
  len: code.length,
  hash: fingerprint(code),
});

/**
 * Wraps the dashboard routes.
 *
 * With no `VITE_DASHBOARD_CODE` configured the dashboard stays open — the
 * marketer must never be locked out of their own tool by a missing env var.
 * With a code configured, every dashboard route asks for it first. The
 * public campaign page (`/c/:slug`) is a separate branch of the route tree
 * and is never gated: a KOL applying has no reason to hold the code.
 */
const DashboardGate = () => {
  const required = dashboardCode;
  const expected = useMemo(() => (required ? unlockRecord(required) : null), [required]);

  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (!expected) return true;
    const stored = readUnlock();
    if (!stored) return false;
    return stored.len === expected.len && sameFingerprint(stored.hash, expected.hash);
  });
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // If the configured code changes, an old unlock flag must not carry over.
  useEffect(() => {
    if (!expected) return;
    const stored = readUnlock();
    if (!stored) return;
    const stillValid =
      stored.len === expected.len && sameFingerprint(stored.hash, expected.hash);
    if (!stillValid) {
      writeUnlock(null);
      setUnlocked(false);
    }
  }, [expected]);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!expected) return;
      const candidate = unlockRecord(value);
      const matches =
        candidate.len === expected.len && sameFingerprint(candidate.hash, expected.hash);
      if (!matches) {
        // The entered code is never logged and never stored.
        setError("That code is not right. Check the code from the marketing team and try again.");
        return;
      }
      writeUnlock(expected);
      setUnlocked(true);
      setError(null);
      setValue("");
    },
    [expected, value],
  );

  if (!expected || unlocked) return <Outlet />;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-base">
            FX
          </div>
          <p className="font-bold text-slate-800 text-sm tracking-tight">FX Creations</p>
        </div>

        <h1 className="mt-7 text-xl font-bold text-slate-900">Dashboard access</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          This area is for the FX Creations marketing team. Enter the access code to continue.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <label htmlFor="dashboard-access-code" className="sr-only">
            Access code
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              id="dashboard-access-code"
              type="password"
              value={value}
              autoFocus
              autoComplete="current-password"
              placeholder="Access code"
              onChange={(event) => {
                setValue(event.target.value);
                if (error) setError(null);
              }}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-1.5 text-xs text-rose-600 leading-relaxed"
            >
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            <KeyRound size={14} /> Unlock dashboard
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400 leading-relaxed">
          This gate keeps casual visitors out of the CRM. It is not a substitute for controlling
          who can open the underlying Google Sheet.
        </p>
      </div>
    </div>
  );
};

export default DashboardGate;
