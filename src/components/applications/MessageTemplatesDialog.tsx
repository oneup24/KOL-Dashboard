import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Eye, MessageSquare, RefreshCw, Save, X } from "lucide-react";
import { useMessageTemplates } from "@/components/shared/MessageTemplatesProvider";
import { MESSAGE_VARIABLES, renderTemplate } from "@/data/messageTemplates";
import type { MessageTemplate } from "@/types";

interface MessageTemplatesDialogProps {
  onClose: () => void;
}

/** Sample values used by the preview button. */
const SAMPLE_VARS: Record<string, string> = {
  kol_name: "Elena H.",
  handle: "@elena_styles",
  whatsapp: "+852 9123 4567",
  email: "elena.h@example.com",
  followers: "120,000",
  platform: "Instagram",
  niche: "Fashion, Lifestyle",
  campaign_name: "Summer Collection Launch",
  campaign_code: "SUM",
  requirements: "• Tag @fxcreations\n• Use #AGSSummer",
  deliverables: "- 1× Reel on Instagram (60–90s)\n- 3× Story on Instagram",
  mandatory_tags: "#AGSSummer",
  disclosure: "#廣告 Advertisement",
  post_start: "2026-10-15",
  post_end: "2026-11-15",
  application_deadline: "2026-10-20",
  brief_url: "https://drive.google.com/fx/summer-collection-2026-brief",
  product_name: "AGS Pro Backpack — Sand",
  product_url: "https://fxcreations.com/products/ags-pro-backpack-sand",
  variant: "AGS Pro — Sand",
  promo_code: "FX-SUM-001",
  discount: "10%",
  store_name: "FX Creations Causeway Bay",
  store_address: "Shop 218, 2/F, Hysan Place, 500 Hennessy Road, Causeway Bay, Hong Kong",
  store_hours: "11:00 – 22:00",
  store_phone: "+852 2882 1218",
  ref: "APP-20261023-4F2A",
  manager_name: "Alice Wong",
  today: "2026-10-23",
  stage_note: "You're approved! We're preparing your product for collection now.",
};

const scopeLabels: Record<MessageTemplate["scope"], string> = {
  sales_prepare: "Store prep",
  kol_approved: "KOL approved",
  kol_pickup: "KOL pickup",
  kol_brief: "KOL brief",
  kol_denied: "KOL declined",
  kol_reminder: "KOL reminder",
};

const MessageTemplatesDialog = ({ onClose }: MessageTemplatesDialogProps) => {
  const { templates, updateTemplateBody, resetTemplates } = useMessageTemplates();
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id ?? "");
  const [draft, setDraft] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const uid = useId();

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? templates[0],
    [templates, selectedId],
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof MESSAGE_VARIABLES>();
    for (const variable of MESSAGE_VARIABLES) {
      const list = map.get(variable.group) ?? [];
      list.push(variable);
      map.set(variable.group, list);
    }
    return Array.from(map.entries());
  }, []);

  const body = draft || selected?.body || "";

  // Unsaved work in the textarea — closing the dialog would throw it away.
  const dirty = draft !== "" && draft !== (selected?.body ?? "");

  /**
   * A long form of copy: closing it discards the edit, so the marketer is
   * asked to confirm first.
   */
  const requestClose = useCallback(() => {
    if (
      dirty &&
      !window.confirm("You have unsaved template changes. Discard them and close the dialog?")
    ) {
      return;
    }
    onClose();
  }, [dirty, onClose]);

  // Escape closes the dialog (with the same guard as the Done button).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        requestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  const handleSave = () => {
    if (!selected) return;
    updateTemplateBody(selected.id, body);
    setDraft("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      {/*
        No backdrop-click-to-close: the copy being edited is long and a
        stray click would silently discard it.
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3
              id={`${uid}-title`}
              className="text-lg font-bold text-slate-800 flex items-center gap-2"
            >
              <MessageSquare size={18} /> Message templates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the copy sent to KOLs. Changes live in this session — there is no backend.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={requestClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 scrollbar-thin">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Templates
            </p>
            <ul className="space-y-1">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(t.id);
                      setDraft("");
                      setPreview(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selected?.id === t.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block font-medium truncate">{t.name}</span>
                    <span
                      className={`block text-[10px] uppercase tracking-wider mt-0.5 ${
                        selected?.id === t.id ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {scopeLabels[t.scope]} · {t.channel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={resetTemplates}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              <RefreshCw size={12} /> Restore shipped copy
            </button>
          </div>

          <div>
            {selected ? (
              <>
                <label
                  htmlFor={`${uid}-body`}
                  className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2"
                >
                  Body — {selected.name}
                </label>
                <textarea
                  id={`${uid}-body`}
                  rows={16}
                  value={body}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setPreview(null);
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-y leading-relaxed"
                />
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
                  >
                    <Save size={14} /> {saved ? "Saved" : "Save template"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview(renderTemplate(body, SAMPLE_VARS))}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                  >
                    <Eye size={14} /> Preview
                  </button>
                </div>

                {preview !== null ? (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      Preview (sample data)
                    </p>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words font-sans leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {preview}
                    </pre>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Variables
            </p>
            <div className="space-y-4">
              {groups.map(([group, variables]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">{group}</p>
                  <ul className="space-y-1">
                    {variables.map((v) => (
                      <li key={v.key}>
                        <button
                          type="button"
                          onClick={() => {
                            setDraft(`${body}\n{{${v.key}}}`);
                            setPreview(null);
                          }}
                          className="w-full text-left hover:bg-slate-50 rounded px-1.5 py-1 transition-colors"
                        >
                          <span className="block font-mono text-[11px] text-slate-700">
                            {"{{" + v.key + "}}"}
                          </span>
                          <span className="block text-[10px] text-slate-400">{v.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={requestClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageTemplatesDialog;
