import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Tag,
  X,
} from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import { useApplications } from "@/context/ApplicationsContext";
import { useCampaigns } from "@/context/CampaignsContext";
import { findStore } from "@/data/stores";
import type { Application, ApplicationStatus, Campaign } from "@/types";
import PlatformBadge from "@/components/shared/PlatformBadge";

interface ApplicationDetailPanelProps {
  application: Application;
  onClose: () => void;
}

const nextStatusFlow: Record<ApplicationStatus, ApplicationStatus[]> = {
  New: ["Reviewing", "Rejected"],
  Reviewing: ["Product Ready", "Rejected"],
  "Product Ready": ["Picked Up", "Rejected"],
  "Picked Up": ["Brief Sent"],
  "Brief Sent": ["Completed"],
  Completed: [],
  Rejected: ["Reviewing"],
};

const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const { updateStatus, getById } = useApplications();
  const { getById: getCampaignById } = useCampaigns();
  // Always read latest from context (in case it was updated elsewhere)
  const live = getById(application.id) ?? application;
  const campaign: Campaign | undefined = getCampaignById(live.campaignId);
  const store = findStore(live.pickupStoreId);
  const nextSteps = nextStatusFlow[live.status];

  const [, setCopied] = useState<string | null>(null);
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <aside className="bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Application
          </p>
          <h2 className="text-lg font-bold text-slate-800 truncate mt-0.5">{live.kolName}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{live.id}</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
        <div>
          <ApplicationStatusBadge status={live.status} />
        </div>

        <Section title="Campaign">
          {campaign ? (
            <div className="flex gap-3">
              <img
                src={campaign.productImage}
                alt={campaign.productName}
                className="w-16 h-16 rounded-lg object-cover border border-slate-100"
              />
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{campaign.name}</p>
                <p className="text-xs text-slate-500 truncate">{campaign.productName}</p>
                <a
                  href={campaign.productUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  Product page <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Unknown campaign.</p>
          )}
        </Section>

        <Section title="KOL contact">
          <div className="space-y-2 text-sm">
            <Row icon={MessageCircle} label="WhatsApp">
              <a
                href={`https://wa.me/${live.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-slate-700 hover:underline"
              >
                {live.whatsapp}
              </a>
              <button
                type="button"
                onClick={() => copy(live.whatsapp, "wa")}
                className="ml-2 text-slate-400 hover:text-slate-700"
                aria-label="Copy WhatsApp"
              >
                <Copy size={12} />
              </button>
            </Row>
            <Row icon={Mail} label="Email">
              <a href={`mailto:${live.email}`} className="text-slate-700 hover:underline">
                {live.email}
              </a>
              <button
                type="button"
                onClick={() => copy(live.email, "email")}
                className="ml-2 text-slate-400 hover:text-slate-700"
                aria-label="Copy email"
              >
                <Copy size={12} />
              </button>
            </Row>
            <Row icon={Tag} label="Social">
              <span className="text-slate-700">
                {live.socialHandle}{" "}
                <span className="text-slate-400 text-xs">· {live.followers || "—"}</span>
              </span>
              <span className="ml-2">
                <PlatformBadge platform={live.socialPlatform} />
              </span>
            </Row>
            <Row icon={Calendar} label="Applied">
              <span className="text-slate-700">{formatDateTime(live.appliedAt)}</span>
            </Row>
          </div>
        </Section>

        <Section title="Pickup">
          {store ? (
            <div className="bg-slate-50 rounded-lg p-3 text-sm">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" /> {store.name}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{store.address}</p>
              <p className="text-xs text-slate-500 mt-1">
                Hours: {store.hours} · Tel: {store.phone}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No store selected.</p>
          )}
          {live.notes ? (
            <p className="mt-3 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                KOL notes
              </span>
              {live.notes}
            </p>
          ) : null}
        </Section>

        {live.promoCode || live.briefSentAt || live.pickedUpAt ? (
          <Section title="Workflow">
            <ul className="space-y-1.5 text-sm text-slate-600">
              {live.pickedUpAt ? (
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-violet-500" /> Product picked up · {formatDateTime(live.pickedUpAt)}
                </li>
              ) : null}
              {live.briefSentAt ? (
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500" /> Brief sent · {formatDateTime(live.briefSentAt)}
                </li>
              ) : null}
              {live.promoCode ? (
                <li className="flex items-center gap-2">
                  <Tag size={14} className="text-emerald-500" /> Promo code:{" "}
                  <span className="font-mono text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {live.promoCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(live.promoCode!, "promo")}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label="Copy promo code"
                  >
                    <Copy size={12} />
                  </button>
                </li>
              ) : null}
            </ul>
          </Section>
        ) : null}
      </div>

      {nextSteps.length > 0 ? (
        <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/60 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Next actions
          </p>
          {nextSteps.map((next) => {
            const handler = () => {
              const extras: Partial<Application> = {};
              if (next === "Picked Up") extras.pickedUpAt = new Date().toISOString();
              if (next === "Brief Sent") {
                extras.briefSentAt = new Date().toISOString();
                if (campaign?.promoCode) extras.promoCode = campaign.promoCode;
              }
              updateStatus(live.id, next, extras);
            };
            const tone =
              next === "Rejected"
                ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                : next === "Completed"
                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  : "border-slate-900 bg-slate-900 text-white hover:bg-slate-800";
            return (
              <button
                key={next}
                type="button"
                onClick={handler}
                className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${tone}`}
              >
                {next === "Product Ready"
                  ? "Mark product ready (notify store)"
                  : next === "Picked Up"
                    ? "Mark as picked up"
                    : next === "Brief Sent"
                      ? "Share brief + promo code"
                      : next === "Completed"
                        ? "Mark completed"
                        : next === "Reviewing"
                          ? "Move to reviewing"
                          : next === "Rejected"
                            ? "Reject application"
                            : `Move to ${next}`}
                <ChevronRight size={14} />
              </button>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
      {title}
    </p>
    {children}
  </div>
);

const Row = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2">
    <Icon size={14} className="text-slate-400 mt-1 flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  </div>
);

const formatDateTime = (iso: string): string => {
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

export default ApplicationDetailPanel;
