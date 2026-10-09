import { useMemo, useState } from "react";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import CampaignsToolbar, {
  type CampaignStatusFilter,
} from "@/components/campaigns/CampaignsToolbar";
import NewCampaignDialog from "@/components/campaigns/NewCampaignDialog";
import ShareCampaignDialog from "@/components/applications/ShareCampaignDialog";
import PageHeader from "@/components/shared/PageHeader";
import { useApplications } from "@/context/ApplicationsContext";
import { useCampaigns } from "@/context/CampaignsContext";
import type { Campaign } from "@/types";

type DialogMode =
  | { kind: "create" }
  | { kind: "edit"; campaign: Campaign }
  | null;

const CampaignsPage = () => {
  const { applications } = useApplications();
  const { campaigns } = useCampaigns();
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<CampaignStatusFilter>("All");
  const [sharing, setSharing] = useState<Campaign | null>(null);
  const [dialog, setDialog] = useState<DialogMode>(null);

  const applicationCounts = useMemo<Record<number, number>>(() => {
    const counts: Record<number, number> = {};
    for (const a of applications) {
      counts[a.campaignId] = (counts[a.campaignId] ?? 0) + 1;
    }
    return counts;
  }, [applications]);

  const filtered = useMemo<Campaign[]>(() => {
    return campaigns.filter((c) => {
      const matchStatus = status === "All" || c.status === status;
      const q = search.trim().toLowerCase();
      const matchSearch =
        q.length === 0 ||
        c.name.toLowerCase().includes(q) ||
        c.manager.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [campaigns, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Plan, track, and measure every KOL campaign end-to-end."
      />
      <CampaignsToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onNewCampaign={() => setDialog({ kind: "create" })}
      />
      <CampaignsTable
        campaigns={filtered}
        applicationCounts={applicationCounts}
        onShare={setSharing}
        onEdit={(c) => setDialog({ kind: "edit", campaign: c })}
      />
      {sharing ? (
        <ShareCampaignDialog campaign={sharing} onClose={() => setSharing(null)} />
      ) : null}
      <NewCampaignDialog mode={dialog} onClose={() => setDialog(null)} />
    </div>
  );
};

export default CampaignsPage;
