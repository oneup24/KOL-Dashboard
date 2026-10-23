import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import CampaignAlertBar from "@/components/campaigns/CampaignAlertBar";
import CampaignBoard from "@/components/campaigns/CampaignBoard";
import CampaignFunnelStrip from "@/components/campaigns/CampaignFunnelStrip";
import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { useApplications } from "@/context/ApplicationsContext";
import { useCampaigns } from "@/context/CampaignsContext";
import type { KpiStat } from "@/types";

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getById } = useCampaigns();
  const { applications } = useApplications();

  const campaignId = Number(id);
  const campaign = Number.isFinite(campaignId) ? getById(campaignId) : undefined;

  const applicationsForCampaign = useMemo(
    () => (campaign ? applications.filter((a) => a.campaignId === campaign.id) : []),
    [applications, campaign],
  );

  if (!campaign) {
    return (
      <SectionCard>
        <EmptyState
          icon={Target}
          title="Campaign not found"
          description="This campaign may have been deleted. Head back to the campaigns list to pick another one."
          action={
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
            >
              <ArrowLeft size={16} /> Back to campaigns
            </Link>
          }
        />
      </SectionCard>
    );
  }

  const approved = applicationsForCampaign.filter((a) =>
    ["Approved", "Product Ready", "Picked Up", "Brief Sent", "Content Live", "Completed"].includes(
      a.status,
    ),
  ).length;
  const live = applicationsForCampaign.filter(
    (a) => a.status === "Content Live" || a.status === "Completed",
  ).length;
  const target = Math.max(1, campaign.targetKolCount);

  const stats: KpiStat[] = [
    {
      title: "Applications",
      value: String(applicationsForCampaign.length),
      change: `${applicationsForCampaign.filter((a) => a.status === "New").length} new`,
      isPositive: true,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      title: "Approved",
      value: String(approved),
      change: `${Math.round((approved / target) * 100)}% of target`,
      isPositive: true,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-100",
    },
    {
      title: "Content live",
      value: String(live),
      change: `${Math.round((live / target) * 100)}% of target`,
      isPositive: true,
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-100",
    },
    {
      title: "Target KOLs",
      value: String(campaign.targetKolCount),
      change: campaign.campaignCode,
      isPositive: true,
      icon: Target,
      color: "text-amber-500",
      bg: "bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} /> All campaigns
      </Link>

      <PageHeader
        title={campaign.name}
        description={`${campaign.productName} · ${campaign.manager || "Unassigned"} · ${campaign.region}`}
        actions={
          <>
            <StatusBadge status={campaign.status} />
            <a
              href={`#/c/${campaign.slug}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Public page <ExternalLink size={14} />
            </a>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <CampaignAlertBar campaign={campaign} applications={applicationsForCampaign} />

      <CampaignFunnelStrip campaign={campaign} applications={applicationsForCampaign} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-800">Pipeline</h3>
          <span className="text-xs text-slate-500">
            Scroll sideways to see every stage
          </span>
        </div>
        <CampaignBoard campaign={campaign} />
      </div>
    </div>
  );
};

export default CampaignDetailPage;
