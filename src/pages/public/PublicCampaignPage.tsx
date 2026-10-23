import { useState } from "react";
import { useParams } from "react-router-dom";
import ApplicationForm from "@/components/public/ApplicationForm";
import ApplicationSuccess from "@/components/public/ApplicationSuccess";
import CampaignBrief from "@/components/public/CampaignBrief";
import CampaignHero from "@/components/public/CampaignHero";
import PublicFooter from "@/components/public/PublicFooter";
import PublicHeader from "@/components/public/PublicHeader";
import { useCampaigns } from "@/context/CampaignsContext";
import { useCampaignMeta } from "@/components/public/useCampaignMeta";
import { isPastDeadline } from "@/components/shared/workflow";
import { Clock, ExternalLink } from "lucide-react";

const PublicCampaignPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug } = useCampaigns();
  const campaign = slug ? getBySlug(slug) : undefined;
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Social preview tags for the share link.
  useCampaignMeta(campaign);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <PublicHeader />
        <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Clock size={32} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Campaign not found</h1>
          <p className="mt-2 text-slate-600">
            The link you used may have expired or is incorrect. Please check with the FX Creations
            marketing team.
          </p>
          {/*
            An internal link here would drop the KOL into the marketer
            dashboard — the only safe destination is the public website.
          */}
          <a
            href="https://fxcreations.com"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-8 inline-flex items-center gap-2 text-sm text-slate-700 underline"
          >
            <ExternalLink size={14} /> Visit fxcreations.com
          </a>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // The public application form is only shown for campaigns that are open to
  // KOLs AND whose application deadline has not passed yet.
  const deadline = campaign.applicationDeadline || campaign.endDate;
  const deadlinePassed = isPastDeadline(deadline);
  const isOpen =
    (campaign.status === "Active" || campaign.status === "Planning") && !deadlinePassed;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader campaignName={campaign.name} />
      <CampaignHero campaign={campaign} canApply={isOpen} />
      <CampaignBrief campaign={campaign} />

      {isOpen ? (
        submittedId ? (
          <ApplicationSuccess
            applicationId={submittedId}
            campaignName={campaign.name}
            onReset={() => setSubmittedId(null)}
          />
        ) : (
          <ApplicationForm campaign={campaign} onSubmitted={setSubmittedId} />
        )
      ) : (
        <section className="bg-slate-50 border-t border-slate-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {deadlinePassed ? "Applications closed" : "Applications not open"}
            </h2>
            <p className="mt-2 text-slate-600">
              {deadlinePassed ? (
                <>
                  Applications for this campaign closed on {deadline}. Follow{" "}
                  <span className="font-medium">@fxcreations</span> for upcoming campaigns.
                </>
              ) : (
                <>
                  This campaign isn&apos;t currently accepting new KOL applications. Check back
                  later or follow <span className="font-medium">@fxcreations</span> for upcoming
                  campaigns.
                </>
              )}
            </p>
          </div>
        </section>
      )}

      <PublicFooter />
    </div>
  );
};

export default PublicCampaignPage;
