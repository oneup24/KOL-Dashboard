import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  CloudOff,
  Loader2,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { useSheets } from "@/context/SheetsContext";

/** "just now" / "4 min ago" / "2 hr ago" / "3 days ago". */
const relativeTime = (iso?: string): string => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

/**
 * The dashboard's sync state, always on screen.
 *
 * A write that never reached the sheet used to be completely invisible, so
 * the marketer only found out when a refresh lost the work. This strip is the
 * one place that says what the sheet is doing — and, more importantly, when
 * it is NOT doing it.
 */
const SyncBanner = () => {
  const { enabled, status, error, lastSyncedAt, lastWrite, refresh } = useSheets();
  const [showSaved, setShowSaved] = useState(false);

  // A short-lived confirmation after a successful write.
  useEffect(() => {
    if (!lastWrite?.ok) {
      setShowSaved(false);
      return;
    }
    setShowSaved(true);
    const timer = window.setTimeout(() => setShowSaved(false), 4000);
    return () => window.clearTimeout(timer);
  }, [lastWrite]);

  const writeFailed = lastWrite && !lastWrite.ok ? lastWrite : undefined;
  const syncing = status === "loading" || status === "syncing";
  // The generic sync error is only shown when there is no more specific one.
  const genericError = status === "error" && !writeFailed;

  const stripClass =
    "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs leading-5";

  return (
    <div className="space-y-2">
      {/* A failed write is more specific than the generic sync error, so it
          gets its own line — with the reason and a way out. */}
      {writeFailed ? (
        <div
          className={`${stripClass} border-rose-200 bg-rose-50 text-rose-700`}
          role="status"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          <span className="font-medium">Google Sheets sync failed:</span>
          <span className="min-w-0 flex-1 truncate" title={writeFailed.error}>
            {writeFailed.error ?? "The write did not reach the sheet."}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="flex-shrink-0 inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-rose-900"
          >
            <RefreshCw size={12} /> Retry
          </button>
          <Link
            to="/settings"
            className="flex-shrink-0 inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-rose-900"
          >
            <Settings2 size={12} /> Open Settings
          </Link>
        </div>
      ) : null}

      {/* The write landed. */}
      {showSaved ? (
        <div
          className={`${stripClass} border-emerald-200 bg-emerald-50 text-emerald-700`}
          role="status"
        >
          <CheckCircle2 size={14} className="flex-shrink-0" />
          <span>Saved to Google Sheets</span>
        </div>
      ) : null}

      {!enabled ? (
        <div
          className={`${stripClass} border-slate-200 bg-slate-100 text-slate-600`}
          role="status"
        >
          <CloudOff size={14} className="flex-shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            Not connected to Google Sheets. Your work lives only in this browser and is lost on
            refresh.
          </span>
          <Link
            to="/settings"
            className="flex-shrink-0 font-medium text-slate-800 underline underline-offset-2 hover:text-slate-900"
          >
            Connect
          </Link>
        </div>
      ) : syncing ? (
        <div
          className={`${stripClass} border-blue-100 bg-blue-50 text-blue-700`}
          role="status"
        >
          <Loader2 size={14} className="flex-shrink-0 animate-spin" />
          <span>Syncing with Google Sheets…</span>
        </div>
      ) : genericError ? (
        <div
          className={`${stripClass} border-rose-200 bg-rose-50 text-rose-700`}
          role="status"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          <span className="font-medium">Google Sheets sync failed:</span>
          <span className="min-w-0 flex-1 truncate" title={error}>
            {error ?? "The sheet could not be reached."}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="flex-shrink-0 inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-rose-900"
          >
            <RefreshCw size={12} /> Retry
          </button>
          <Link
            to="/settings"
            className="flex-shrink-0 inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-rose-900"
          >
            <Settings2 size={12} /> Open Settings
          </Link>
        </div>
      ) : (
        <div
          className={`${stripClass} border-emerald-100 bg-emerald-50 text-emerald-700`}
          role="status"
        >
          <CheckCircle2 size={14} className="flex-shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            Synced with Google Sheets
            {lastSyncedAt ? ` · ${relativeTime(lastSyncedAt)}` : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default SyncBanner;
