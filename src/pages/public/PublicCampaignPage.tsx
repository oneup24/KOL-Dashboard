import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import ApplicationForm from "@/components/public/ApplicationForm";
import ApplicationSuccess from "@/components/public/ApplicationSuccess";
import CampaignBrief from "@/components/public/CampaignBrief";
import CampaignHero from "@/components/public/CampaignHero";
import PublicFooter from "@/components/public/PublicFooter";
import PublicHeader from "@/components/public/PublicHeader";
import { useCampaigns } from "@/context/CampaignsContext";
import { ArrowLeft, Clock } from "lucide-react";

const PublicCampaignPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug } = useCampaigns();
  const campaign = slug ? getBySlug(slug) : undefined;
  const [submittedId, setSubmittedId] = useState<string | null>(null);

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
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 text-sm text-slate-700 underline"
          >
            <ArrowLeft size={14} /> Back to FX Creations
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Only show the public application form for campaigns that are open to KOLs
  const isOpen = campaign.status === "Active" || campaign.status === "Planning";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader campaignName={campaign.name} />
      <CampaignHero campaign={campaign} />
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
            <h2 className="text-2xl font-bold text-slate-900">Applications closed</h2>
            <p className="mt-2 text-slate-600">
              This campaign isn't currently accepting new KOL applications. Check back later or
              follow <span className="font-medium">@fxcreations</span> for upcoming campaigns.
            </p>
          </div>
        </section>
      )}

      <PublicFooter />
    </div>
  );
};

export default PublicCampaignPage;
