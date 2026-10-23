import { CalendarDays, Clock, ExternalLink, MapPin, Sparkles } from "lucide-react";
import type { Campaign } from "@/types";

interface CampaignHeroProps {
  campaign: Campaign;
  /** False when the campaign is not accepting applications (the CTA is hidden). */
  canApply?: boolean;
}

/** "2026-10-20" -> "20 Oct 2026". Falls back to the raw value. */
const formatDate = (iso: string, withYear: boolean): string => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
};

const CampaignHero = ({ campaign, canApply = true }: CampaignHeroProps) => {
  // Applications close on the application deadline — `endDate` is the post
  // deadline and must never be shown as the apply-by date.
  const applyBy = campaign.applicationDeadline || campaign.endDate;
  const contentWindow =
    campaign.postStartDate || campaign.postEndDate
      ? `${formatDate(campaign.postStartDate, false)} – ${formatDate(campaign.postEndDate, false)}`
      : null;

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
            <Sparkles size={12} /> KOL Campaign · {campaign.platform}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            {campaign.productName}
          </h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-xl">
            {campaign.productDescription}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} /> Apply by {formatDate(applyBy, true)}
            </span>
            {contentWindow ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} /> Content live: {contentWindow}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> Pickup in {campaign.region}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={campaign.productUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              View Product <ExternalLink size={14} />
            </a>
            {/*
              A plain anchor to "#apply" would be read as a route by the
              HashRouter (the hash IS the path) and bounce the KOL to the
              not-found page — so this scrolls to the form instead.
            */}
            {canApply ? (
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("apply")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Apply to be a KOL
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-violet-200/40 via-pink-200/40 to-amber-200/40 rounded-3xl blur-2xl" aria-hidden="true" />
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-100">
            <img
              src={campaign.productImage}
              alt={campaign.productName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampaignHero;
