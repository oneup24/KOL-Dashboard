import { Check, ListChecks, Megaphone, Tag } from "lucide-react";
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
        <div className="mt-3 flex flex-wrap gap-2">
          {campaign.deliverables.map((d) => (
            <span
              key={d}
              className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200"
            >
              {d}
            </span>
          ))}
        </div>
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
            Exclusive promo code for your audience
            {campaign.promoCode ? (
              <span className="ml-1 font-mono text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                {campaign.promoCode}
              </span>
            ) : null}
          </li>
          <li className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5" />
            Featured on @fxcreations if performance is strong
          </li>
        </ul>
      </aside>
    </div>
  </section>
);

export default CampaignBrief;
