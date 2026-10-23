import { ExternalLink, History, Mail, MessageCircle, X } from "lucide-react";
import { useEffect, useId } from "react";
import PlatformBadge from "@/components/shared/PlatformBadge";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatFollowers } from "@/data/seedKols";
import { useCampaigns } from "@/context/CampaignsContext";
import type { Kol } from "@/types";

interface KolProfileDialogProps {
  kol: Kol;
  onClose: () => void;
}

const sourceLabels: Record<Kol["source"], string> = {
  fb_group: "FB group",
  referral: "Referral",
  inbound: "Inbound",
  event: "Event",
  other: "Other",
};

const KolProfileDialog = ({ kol, onClose }: KolProfileDialogProps) => {
  const { getById: getCampaignById } = useCampaigns();
  const uid = useId();

  // Escape closes the dialog.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={kol.avatar}
              alt={kol.name}
              className="w-14 h-14 rounded-full border border-slate-200 flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 id={`${uid}-title`} className="text-lg font-bold text-slate-800 truncate">
                {kol.name}
              </h3>
              <p className="text-xs text-slate-500">@{kol.handle}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StatusBadge status={kol.status} />
                <PlatformBadge platform={kol.primaryPlatform} />
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Followers" value={formatFollowers(kol.followers)} />
            <Stat label="Engagement" value={`${kol.er}%`} />
            <Stat label="Rating" value={String(kol.rating)} />
            <Stat label="Rate card" value={kol.rateCard} />
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Niches" value={kol.niches.join(", ") || "—"} />
            <Detail label="Region" value={kol.region || "—"} />
            <Detail label="Source" value={sourceLabels[kol.source]} />
            <Detail label="Tier" value={kol.tier} />
            <Detail label="Tags" value={kol.tags.join(", ") || "—"} />
            <Detail label="Added" value={kol.dateAdded.slice(0, 10)} />
            <Detail
              label="Last contacted"
              value={kol.lastContactedAt ? kol.lastContactedAt.slice(0, 10) : "—"}
            />
            <Detail
              label="WhatsApp"
              value={
                kol.whatsapp ? (
                  <a
                    href={`https://wa.me/${kol.whatsapp.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-slate-700 hover:underline"
                  >
                    <MessageCircle size={12} /> {kol.whatsapp}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Detail
              label="Email"
              value={
                kol.email ? (
                  <a
                    href={`mailto:${kol.email}`}
                    className="inline-flex items-center gap-1 text-slate-700 hover:underline"
                  >
                    <Mail size={12} /> {kol.email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </dl>

          {kol.notes ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-slate-700">
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                Notes
              </span>
              {kol.notes}
            </div>
          ) : null}

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <History size={12} /> Post history ({kol.posts.length})
            </p>
            {kol.posts.length === 0 ? (
              <p className="text-sm text-slate-500">
                No posts recorded yet — capture one from the application detail panel.
              </p>
            ) : (
              <ul className="space-y-3">
                {kol.posts.map((post) => {
                  const campaign = getCampaignById(post.campaignId);
                  return (
                    <li key={post.id} className="border border-slate-100 rounded-lg p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">
                          {campaign?.name ?? `Campaign #${post.campaignId}`}
                        </span>
                        <PlatformBadge platform={post.platform} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Posted {post.postDate}
                        {post.postType ? ` · ${post.postType}` : ""}
                        {post.variantId
                          ? ` · ${campaign?.variants.find((v) => v.id === post.variantId)?.label ?? post.variantId}`
                          : ""}
                      </p>
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 break-all"
                      >
                        {post.postUrl} <ExternalLink size={10} className="flex-shrink-0" />
                      </a>
                      {post.metrics ? (
                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                          <Metric label="Reach" value={post.metrics.reach} />
                          <Metric label="Views" value={post.metrics.views} />
                          <Metric label="Likes" value={post.metrics.likes} />
                          <Metric label="Comments" value={post.metrics.comments} />
                          <Metric label="Saves" value={post.metrics.saves} />
                          <Metric label="ER" value={post.metrics.er ? `${post.metrics.er}%` : undefined} />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
    <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
    <p className="font-semibold text-slate-800 mt-0.5">{value}</p>
  </div>
);

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <dt className="text-[10px] uppercase tracking-wider text-slate-400">{label}</dt>
    <dd className="text-slate-700 mt-0.5 break-words">{value}</dd>
  </div>
);

const Metric = ({ label, value }: { label: string; value?: number | string }) => (
  <div className="bg-slate-50 rounded-lg py-1.5">
    <p className="text-[9px] uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-xs font-semibold text-slate-700">
      {value === undefined ? "—" : typeof value === "number" ? value.toLocaleString("en-US") : value}
    </p>
  </div>
);

export default KolProfileDialog;
