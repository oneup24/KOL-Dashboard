import { Calendar, Download } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import ReportCampaignTable from "@/components/reports/ReportCampaignTable";
import ReportChannelChart from "@/components/reports/ReportChannelChart";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";

const ReportsPage = () => (
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
          <button
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            <Download size={16} /> Export
          </button>
        </>
      }
    />
    <ReportSummaryCards />
    <ReportChannelChart />
    <ReportCampaignTable />
  </div>
);

export default ReportsPage;
