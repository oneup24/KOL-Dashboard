import { useMemo } from "react";
import { Calendar } from "lucide-react";
import ExportMenu from "@/components/shared/ExportMenu";
import PageHeader from "@/components/shared/PageHeader";
import ReportCampaignTable from "@/components/reports/ReportCampaignTable";
import ReportChannelChart from "@/components/reports/ReportChannelChart";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
import { useApplications } from "@/context/ApplicationsContext";
import { useCampaigns } from "@/context/CampaignsContext";
import { useKol } from "@/context/KolContext";
import { useSheets } from "@/context/SheetsContext";
import type { ExportRow } from "@/utils/export";

const ReportsPage = () => {
  const { campaigns } = useCampaigns();
  const { applications } = useApplications();
  const { kols } = useKol();
  const { pushAll } = useSheets();

  // Campaign performance for the boss report — joined with the live
  // application counts rather than the seed constants.
  const campaignRows = useMemo<ExportRow[]>(() => {
    const kolCount = new Map<number, number>();
    const doneCount = new Map<number, number>();
    for (const a of applications) {
      kolCount.set(a.campaignId, (kolCount.get(a.campaignId) ?? 0) + 1);
      if (a.status === "Completed" || a.status === "Content Live") {
        doneCount.set(a.campaignId, (doneCount.get(a.campaignId) ?? 0) + 1);
      }
    }
    return campaigns.map((c) => ({
      Campaign: c.name,
      "Campaign code": c.campaignCode,
      Status: c.status,
      Platform: c.platform,
      Region: c.region,
      Manager: c.manager,
      Product: c.productName,
      "Target KOLs": c.targetKolCount,
      "Applications": kolCount.get(c.id) ?? 0,
      "Delivered": doneCount.get(c.id) ?? 0,
      "Fee model": c.feeModel,
      "Fee per KOL": c.feePerKol,
      "Commission %": c.commissionPct,
      Budget: c.budget,
      "Total budget": c.totalBudget,
      "Apply by": c.applicationDeadline,
      "Post start": c.postStartDate,
      "Post end": c.postEndDate,
      "Mandatory tags": c.mandatoryTags.join(" "),
      "Disclosure": c.disclosureText,
      "Public link": `/c/${c.slug}`,
    }));
  }, [campaigns, applications]);

  // The KOL roster — the CRM list your team works from.
  const kolRows = useMemo<ExportRow[]>(
    () =>
      kols.map((k) => ({
        "KOL ID": k.id,
        Name: k.name,
        Handle: k.handle,
        Platform: k.primaryPlatform,
        Followers: k.followers,
        "Eng. rate %": k.er,
        WhatsApp: k.whatsapp,
        Email: k.email,
        Region: k.region,
        Tier: k.tier,
        Niches: k.niches.join(", "),
        "Rate card": k.rateCard,
        Source: k.source,
        Status: k.status,
        Rating: k.rating,
        "Date added": k.dateAdded,
        "Last contacted": k.lastContactedAt ?? "",
        "Posts live": k.posts.length,
        Notes: k.notes ?? "",
      })),
    [kols],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Consolidated performance, ROI, and channel insights across all campaigns."
        actions={
          <>
            <button
              type="button"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Calendar size={16} /> Last 30 Days
            </button>
            <ExportMenu
              rows={campaignRows}
              filename="kol-campaign-report"
              onPushToSheet={() => pushAll("campaigns", campaigns)}
              pushLabel="Push campaigns to sheet"
            />
            <ExportMenu rows={kolRows} filename="kol-database" />
          </>
        }
      />
      <ReportSummaryCards />
      <ReportChannelChart />
      <ReportCampaignTable />
    </div>
  );
};

export default ReportsPage;
