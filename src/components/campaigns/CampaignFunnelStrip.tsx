import ProgressBar from "@/components/shared/ProgressBar";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/components/shared/workflow";
import type { Application, Campaign } from "@/types";

interface CampaignFunnelStripProps {
  campaign: Campaign;
  applications: Application[];
}

/**
 * A compact funnel of the pipeline: how many applications sit in each stage
 * and how far the campaign is towards its KOL target.
 */
const CampaignFunnelStrip = ({ campaign, applications }: CampaignFunnelStripProps) => {
  const target = Math.max(1, campaign.targetKolCount);
  const counts = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: applications.filter((a) => a.status === stage).length,
  }));
  const active = applications.filter((a) => a.status !== "Rejected").length;
  const progress = Math.min(100, Math.round((active / target) * 100));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Funnel</p>
          <p className="text-xs text-slate-500">
            {active} active application{active === 1 ? "" : "s"} of {campaign.targetKolCount}{" "}
            target KOLs
          </p>
        </div>
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
            <span>Overall progress</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {counts.map(({ stage, count }) => {
          const percentage = Math.round((count / target) * 100);
          return (
            <div key={stage} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 truncate">
                {STAGE_LABELS[stage]}
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{count}</p>
              <p className="text-[10px] text-slate-400">{percentage}% of target</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignFunnelStrip;
