import { useEffect, useRef, useState } from "react";
import { Check, ClipboardCopy, CloudUpload, Download } from "lucide-react";
import { copyTsv, downloadCsv, timestampSlug, type ExportRow } from "@/utils/export";

interface ExportMenuProps {
  /** Rows to export. */
  rows: ExportRow[];
  /** Base filename, without extension. */
  filename: string;
  /** Column order. Defaults to the keys of the first row. */
  columns?: string[];
  /** Label for the trigger button. */
  label?: string;
  /** When provided, offers a "push everything to the sheet" action. */
  onPushToSheet?: () => void;
  pushLabel?: string;
}

const ExportMenu = ({
  rows,
  filename,
  columns,
  label = "Export",
  onPushToSheet,
  pushLabel = "Push all to sheet",
}: ExportMenuProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleCopy = async () => {
    const ok = await copyTsv(rows, columns);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const disabled = rows.length === 0;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        <Download size={16} /> {label}
      </button>

      {open ? (
        <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-100 z-30 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              downloadCsv(`${filename}-${timestampSlug()}`, rows, columns);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Download size={14} />
            <span className="text-left">
              Download CSV
              <span className="block text-xs text-slate-500">For Excel / Numbers</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-100"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <ClipboardCopy size={14} />}
            <span className="text-left">
              {copied ? "Copied" : "Copy for Sheets"}
              <span className="block text-xs text-slate-500">Paste into a sheet tab</span>
            </span>
          </button>
          {onPushToSheet ? (
            <button
              type="button"
              onClick={() => {
                onPushToSheet();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-100"
            >
              <CloudUpload size={14} />
              <span className="text-left">
                {pushLabel}
                <span className="block text-xs text-slate-500">Overwrite rows in your sheet</span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ExportMenu;
