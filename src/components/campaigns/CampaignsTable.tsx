import { Clock, DollarSign, Share2, Users } from "lucide-react";
import ProgressBar from "@/components/shared/ProgressBar";
import PlatformBadge from "@/components/shared/PlatformBadge";
import SectionCard from "@/components/shared/SectionCard";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import CampaignRowActions from "@/components/campaigns/CampaignRowActions";
import { Calendar as CalendarIcon } from "lucide-react";
import type { Campaign } from "@/types";

interface CampaignsTableProps {
  campaigns: Campaign[];
  applicationCounts: Record<number, number>;
  onShare: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
}

const CampaignsTable = ({ campaigns, applicationCounts, onShare, onEdit }: CampaignsTableProps) => {
  if (campaigns.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          icon={CalendarIcon}
          title="No campaigns found"
          description="Try adjusting your filters or create a new campaign to get started."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard noPadding>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Campaign</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Platform</th>
              <th className="px-6 py-3 text-left font-semibold">KOLs</th>
              <th className="px-6 py-3 text-left font-semibold">Budget</th>
              <th className="px-6 py-3 text-left font-semibold w-48">Progress</th>
              <th className="px-6 py-3 text-left font-semibold">End Date</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.map((c) => {
              const apps = applicationCounts[c.id] ?? 0;
              return (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>
                        {c.manager || "—"} • {c.region || "—"}
                      </span>
                      {apps > 0 ? (
                        <span className="inline-flex items-center gap-1 text-violet-600 font-medium">
                          · {apps} application{apps === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PlatformBadge platform={c.platform} />
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <Users size={14} className="text-slate-400" /> {c.kols}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign size={14} className="text-slate-400" /> {c.budget || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={c.progress} className="flex-1" />
                      <span className="text-xs font-medium text-slate-600 w-9 text-right">
                        {c.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" /> {c.endDate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onShare(c)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
                      >
                        <Share2 size={14} /> Share
                      </button>
                      <CampaignRowActions campaign={c} onEdit={onEdit} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

export default CampaignsTable;
