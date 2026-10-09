import { Copy, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import type { Campaign } from "@/types";

interface ShareCampaignDialogProps {
  campaign: Campaign;
  onClose: () => void;
}

const buildPublicUrl = (slug: string): string => {
  if (typeof window === "undefined") return `/c/${slug}`;
  // Vite exposes the configured `base` at build time as BASE_URL (always
  // ends with "/"). On dev it's "/" so we get a clean localhost URL; on
  // production it's "/kol-dashboard/" so the share link points at the
  // real deployed path under the GitHub Pages project page.
  const base = import.meta.env.BASE_URL;
  return `${window.location.origin}${base}c/${slug}`;
};

const ShareCampaignDialog = ({ campaign, onClose }: ShareCampaignDialogProps) => {
  const url = buildPublicUrl(campaign.slug);
  const [copied, setCopied] = useState<"url" | "text" | null>(null);

  const copy = async (text: string, key: "url" | "text") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const dmText = `Hi! FX Creations here — we'd love to invite you to our ${campaign.name} KOL campaign.\n\nApply here: ${url}`;

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Share campaign</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex gap-3">
            <img
              src={campaign.productImage}
              alt={campaign.productName}
              className="w-20 h-20 rounded-lg object-cover border border-slate-100 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Campaign
              </p>
              <p className="font-semibold text-slate-800 truncate">{campaign.name}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{campaign.productName}</p>
              <a
                href={`/c/${campaign.slug}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
              >
                Preview public page <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Public link
            </p>
            <div className="flex">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-l-lg text-xs font-mono text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={() => copy(url, "url")}
                className="px-3 inline-flex items-center gap-1.5 bg-slate-900 text-white text-sm font-medium rounded-r-lg hover:bg-slate-800"
              >
                <Copy size={14} /> {copied === "url" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Pre-filled DM (for Messenger / WhatsApp)
            </p>
            <textarea
              readOnly
              value={dmText}
              onFocus={(e) => e.currentTarget.select()}
              rows={4}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none resize-none"
            />
            <button
              type="button"
              onClick={() => copy(dmText, "text")}
              className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              <Copy size={14} /> {copied === "text" ? "Copied" : "Copy message"}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Heads up:</span> only{" "}
            <span className="font-medium">Active</span> and <span className="font-medium">Planning</span>{" "}
            campaigns accept new applications on the public page.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCampaignDialog;
