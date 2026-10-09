import type { CampaignStatus } from "@/types";

const statusStyles: Record<CampaignStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Planning: "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-slate-100 text-slate-700 border-slate-200",
  Draft: "bg-orange-100 text-orange-700 border-orange-200",
};

interface StatusBadgeProps {
  status: CampaignStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyles[status]}`}>
    {status}
  </span>
);

export default StatusBadge;
