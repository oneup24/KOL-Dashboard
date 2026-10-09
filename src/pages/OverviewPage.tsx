import ActiveCampaignsCard from "@/components/overview/ActiveCampaignsCard";
import KpiGrid from "@/components/overview/KpiGrid";
import PerformanceTrendsChart from "@/components/overview/PerformanceTrendsChart";
import PlatformBreakdownChart from "@/components/overview/PlatformBreakdownChart";
import TopKolsCard from "@/components/overview/TopKolsCard";
import PageHeader from "@/components/shared/PageHeader";

const OverviewPage = () => (
  <div className="space-y-6">
    <PageHeader
      title="Dashboard Overview"
      description="Track your overall KOL campaign performance."
    />

    <KpiGrid />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PerformanceTrendsChart />
      <PlatformBreakdownChart />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ActiveCampaignsCard />
      <TopKolsCard />
    </div>
  </div>
);

export default OverviewPage;
