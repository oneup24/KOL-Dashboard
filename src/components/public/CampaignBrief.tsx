import { Check, ListChecks, Megaphone, Tag } from "lucide-react";
import PlatformBadge from "@/components/shared/PlatformBadge";
import type { Campaign } from "@/types";

interface CampaignBriefProps {
  campaign: Campaign;
}

const CampaignBrief = ({ campaign }: CampaignBriefProps) => (
  <section className="bg-white border-t border-slate-100">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Megaphone size={20} className="text-violet-500" /> Campaign brief
        </h2>
        <p className="mt-3 text-slate-600 text-base leading-relaxed">{campaign.campaignBrief}</p>

        <h3 className="mt-8 text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <ListChecks size={14} /> Requirements
        </h3>
        <ul className="mt-3 space-y-2">
          {campaign.requirements.map((req) => (
            <li key={req} className="flex items-start gap-2 text-slate-700">
              <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{req}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Deliverables
        </h3>
        <div className="mt-3 space-y-2">
          {campaign.deliverables.map((d, index) => (
            <div
              key={`${d.platform}-${d.type}-${d.count}-${index}`}
              className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
            >
              <span className="font-semibold text-slate-800 text-sm">
                {d.count}× {d.type}
              </span>
              <PlatformBadge platform={d.platform} />
              {d.length ? (
                <span className="text-xs text-slate-500">· {d.length}</span>
              ) : null}
              {d.notes ? (
                <span className="text-xs text-slate-500">· {d.notes}</span>
              ) : null}
            </div>
          ))}
        </div>

        {campaign.mandatoryTags.length > 0 || campaign.mandatoryMentions.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Mandatory tags &amp; mentions
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {campaign.mandatoryTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-violet-50 text-violet-700 border border-violet-200"
                >
                  {tag}
                </span>
              ))}
              {campaign.mandatoryMentions.map((mention) => (
                <span
                  key={mention}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {mention}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <aside className="bg-slate-50 rounded-2xl border border-slate-100 p-6 h-fit">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Tag size={14} /> Perks for selected KOLs
        </h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5" />
            Free product to keep
          </li>
          <li className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5" />
            Store pickup — no shipping hassle
          </li>
          <li className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5" />
            Exclusive promo code for your audience (issued after approval)
          </li>
          <li className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5" />
            Featured on @fxcreations if performance is strong
          </li>
        </ul>

        {/*
         The fee block is gated on the campaign owner's "show the fee details"
         toggle. A campaign with no cash involved must not mention a fee at
         all — showing "Gift" makes a KOL wonder whether they can ask for
         money.
        */}
        {campaign.feeDisplayEnabled ? (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              What you will earn
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {campaign.feeDisplayText?.trim() ||
                (campaign.feeModel === "flat"
                  ? `Flat fee of $${campaign.feePerKol.toLocaleString("en-US")} per KOL`
                  : campaign.feeModel === "commission"
                    ? `${campaign.commissionPct}% commission per sale`
                    : campaign.feeModel === "flat_commission"
                      ? `Flat fee of $${campaign.feePerKol.toLocaleString("en-US")} plus ${campaign.commissionPct}% commission`
                      : "A special gift for every selected KOL")}
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  </section>
);

export default CampaignBrief;
