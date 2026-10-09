import { Filter, Plus, Search } from "lucide-react";
import type { CampaignStatus } from "@/types";

export type CampaignStatusFilter = "All" | CampaignStatus;

interface CampaignsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: CampaignStatusFilter;
  onStatusChange: (s: CampaignStatusFilter) => void;
  onNewCampaign: () => void;
}

const statuses: CampaignStatusFilter[] = ["All", "Active", "Planning", "Completed", "Draft"];

const CampaignsToolbar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onNewCampaign,
}: CampaignsToolbarProps) => (
  <div className="flex flex-col gap-4 mb-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="relative w-full sm:max-w-sm">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search campaigns by name or manager..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onNewCampaign}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((s) => {
        const isActive = status === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(s)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
              isActive
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        );
      })}
      <span className="text-xs text-slate-400 ml-2">
        <Filter size={12} className="inline mr-1" />
        More filters coming soon
      </span>
    </div>
  </div>
);

export default CampaignsToolbar;
