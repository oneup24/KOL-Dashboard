import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  Database,
  ExternalLink,
  Loader2,
  RefreshCw,
  Save,
  Settings2,
} from "lucide-react";
import { useSheets } from "@/context/SheetsContext";
import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";

const statusMeta: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  disabled: {
    label: "Not connected",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Database,
  },
  idle: {
    label: "Ready",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Database,
  },
  loading: {
    label: "Loading…",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Loader2,
  },
  syncing: {
    label: "Syncing…",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Loader2,
  },
  ok: {
    label: "Synced",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  error: {
    label: "Sync error",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    icon: AlertCircle,
  },
};

const SettingsPage = () => {
  const {
    url,
    setUrl,
    buildHookUrl,
    setBuildHookUrl,
    status,
    lastSyncedAt,
    error,
    errorHint,
    spreadsheetName,
    spreadsheetUrl,
    refresh,
    testConnection,
    triggerBuild,
  } = useSheets();

  const [urlDraft, setUrlDraft] = useState(url);
  const [hookDraft, setHookDraft] = useState(buildHookUrl);
  const [saved, setSaved] = useState(false);

  const meta = statusMeta[status] ?? statusMeta.idle;
  const StatusIcon = meta.icon;

  const save = () => {
    setUrl(urlDraft);
    setBuildHookUrl(hookDraft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Connect the dashboard to a Google Sheet so campaigns, KOLs and applications survive a refresh."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Google Sheets">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sheets-url"
                  className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5"
                >
                  Apps Script web app URL
                </label>
                <input
                  id="sheets-url"
                  type="url"
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbXXXX/exec"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Stored in this browser only. See{" "}
                  <code className="font-mono bg-slate-100 px-1 rounded">scripts/google-sheets.gas</code>{" "}
                  for the setup steps.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={save}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                >
                  {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => void testConnection()}
                  disabled={!url.trim() || status === "loading"}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <CloudUpload size={14} /> Test connection
                </button>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={!url.trim() || status === "loading"}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw size={14} /> Reload from sheet
                </button>
              </div>

              {error ? (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                  <p className="text-sm font-medium text-rose-800 flex items-start gap-2">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </p>
                  {errorHint ? (
                    <p className="mt-1.5 text-xs text-rose-700 pl-6">{errorHint}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            title="Link previews"
            description="Each campaign gets a static page with Open Graph tags so the link preview in Messenger, WhatsApp and Facebook shows the product instead of a blank card."
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="build-hook"
                  className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5"
                >
                  Netlify build hook URL
                </label>
                <input
                  id="build-hook"
                  type="url"
                  value={hookDraft}
                  onChange={(e) => setHookDraft(e.target.value)}
                  placeholder="https://api.netlify.com/build_hooks/xxxx"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Optional. When set, creating a campaign triggers a rebuild so its preview page
                  appears. Create one in Netlify under{" "}
                  <span className="font-medium">Site configuration → Build &amp; deploy → Build hooks</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBuildHookUrl(hookDraft);
                  triggerBuild();
                }}
                disabled={!hookDraft.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={14} /> Save &amp; trigger rebuild
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Status">
            <div className="space-y-4">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${meta.className}`}
              >
                <StatusIcon size={12} className={status === "loading" || status === "syncing" ? "animate-spin" : ""} />
                {meta.label}
              </span>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Spreadsheet</dt>
                  <dd className="text-slate-800">
                    {spreadsheetUrl ? (
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-slate-700 underline"
                      >
                        {spreadsheetName} <ExternalLink size={11} />
                      </a>
                    ) : (
                      (spreadsheetName ?? "—")
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Last synced</dt>
                  <dd className="text-slate-800">
                    {lastSyncedAt
                      ? new Date(lastSyncedAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </SectionCard>

          <SectionCard title="How it works">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <Settings2 size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                The sheet has four tabs: Campaigns, KOLs, Applications, MessageLog.
              </li>
              <li className="flex gap-2">
                <Settings2 size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                Every change in the dashboard writes straight back to its tab.
              </li>
              <li className="flex gap-2">
                <Settings2 size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                The sheet loads once when you open the dashboard. Later edits here win — two
                marketers editing at the same time is last-write-wins.
              </li>
              <li className="flex gap-2">
                <ExternalLink size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <a
                  href="https://script.google.com/home"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-slate-700 underline"
                >
                  Open Google Apps Script
                </a>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
