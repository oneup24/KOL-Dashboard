import type { CampaignStatus, KolStatus } from "@/types";

const campaignStyles: Record<CampaignStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Planning: "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-slate-100 text-slate-700 border-slate-200",
  Draft: "bg-orange-100 text-orange-700 border-orange-200",
};

const kolStyles: Record<KolStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  prospect: "bg-blue-100 text-blue-700 border-blue-200",
  blacklist: "bg-rose-100 text-rose-700 border-rose-200",
};

const isCampaignStatus = (status: CampaignStatus | KolStatus): status is CampaignStatus =>
  status === "Active" || status === "Planning" || status === "Completed" || status === "Draft";

interface StatusBadgeProps {
  status: CampaignStatus | KolStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = isCampaignStatus(status)
    ? campaignStyles[status]
    : kolStyles[status];
  const label = isCampaignStatus(status)
    ? status
    : `${status.charAt(0).toUpperCase()}${status.slice(1)}`;

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
