import { useMemo, useState } from "react";
import {
  Copy,
  History,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
} from "lucide-react";
import { useApplications } from "@/context/ApplicationsContext";
import { useMessageTemplates } from "@/components/shared/MessageTemplatesProvider";
import { buildMessageVars, renderTemplate } from "@/data/messageTemplates";
import { scopeForStatus, stageNote, whatsappLink } from "@/components/shared/workflow";
import type {
  Application,
  Campaign,
  Kol,
  MessageChannel,
  MessageTemplate,
} from "@/types";

interface ApplicationMessagePanelProps {
  application: Application;
  kol: Kol | undefined;
  campaign: Campaign | undefined;
}

const SENT_BY = "Marketing Admin";

const formatSentAt = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const channelLabel: Record<MessageChannel, string> = {
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  email: "Email",
  copy: "Clipboard",
};

const ApplicationMessagePanel = ({
  application,
  kol,
  campaign,
}: ApplicationMessagePanelProps) => {
  const { logMessage, messagesFor } = useApplications();
  const { templates, byScope } = useMessageTemplates();
  const [templateId, setTemplateId] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  const scope = scopeForStatus(application.status);
  const scoped: MessageTemplate[] = useMemo(() => byScope(scope), [byScope, scope]);

  const activeTemplate = useMemo(() => {
    const chosen = scoped.find((t) => t.id === templateId);
    return chosen ?? scoped.find((t) => t.isDefault) ?? scoped[0] ?? templates[0];
  }, [scoped, templateId, templates]);

  const rendered = useMemo(() => {
    if (!activeTemplate) return "";
    const vars = buildMessageVars({ application, kol, campaign });
    return renderTemplate(activeTemplate.body, { ...vars, stage_note: stageNote(application.status) });
  }, [activeTemplate, application, kol, campaign]);

  const history = messagesFor(application.id);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable — the text is still selectable in the block below
    }
  };

  const log = (channel: MessageChannel, recipient: string) => {
    if (!activeTemplate) return;
    logMessage({
      templateId: activeTemplate.id,
      applicationId: application.id,
      recipient,
      channel,
      renderedBody: rendered,
      sentBy: SENT_BY,
    });
  };

  const handleCopy = async () => {
    await copyText(rendered, "copy");
    log("copy", kol?.whatsapp ?? kol?.email ?? "");
  };

  const handleWhatsApp = () => {
    if (!kol?.whatsapp) return;
    window.open(whatsappLink(kol.whatsapp, rendered), "_blank", "noopener");
    log("whatsapp", kol.whatsapp);
  };

  const handleMessenger = async () => {
    await copyText(rendered, "messenger");
    log("messenger", kol?.email ?? kol?.whatsapp ?? "");
  };

  const handleEmail = async () => {
    await copyText(rendered, "email");
    log("email", kol?.email ?? "");
  };

  if (!activeTemplate) {
    return (
      <p className="text-sm text-slate-500">
        No message template is registered for this stage yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
            Template for "{application.status}"
          </p>
          <select
            value={activeTemplate.id}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
          >
            {scoped.length > 0 ? (
              scoped.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            ) : (
              <option value={activeTemplate.id}>{activeTemplate.name}</option>
            )}
          </select>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words font-sans leading-relaxed max-h-64 overflow-auto scrollbar-thin">
            {rendered}
          </pre>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
          >
            <Copy size={14} /> {copied === "copy" ? "Copied" : "Copy message"}
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={!kol?.whatsapp}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            <MessageCircle size={14} /> Open in WhatsApp
          </button>
          <button
            type="button"
            onClick={handleMessenger}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
          >
            <MessageSquare size={14} /> {copied === "messenger" ? "Copied" : "Messenger (copy)"}
          </button>
          <button
            type="button"
            onClick={handleEmail}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
          >
            <Mail size={14} /> {copied === "email" ? "Copied" : "Email (copy)"}
          </button>
        </div>

        {!kol?.whatsapp ? (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            This KOL has no WhatsApp number on file — use the copy buttons instead.
          </p>
        ) : null}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
          <History size={12} /> Sent history
        </p>
        {history.length === 0 ? (
          <p className="text-xs text-slate-500">No messages logged for this application yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((entry) => (
              <li key={entry.id} className="bg-white border border-slate-100 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {channelLabel[entry.channel]}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    {formatSentAt(entry.sentAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  → {entry.recipient || "no recipient"}
                </p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 whitespace-pre-wrap">
                  {entry.renderedBody}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
        <Send size={11} /> Every send is logged against the application for audit.
      </p>
    </div>
  );
};

export default ApplicationMessagePanel;
