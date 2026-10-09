import { Clock, DollarSign, Users } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressBar from "@/components/shared/ProgressBar";
import SectionCard from "@/components/shared/SectionCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { useCampaigns } from "@/context/CampaignsContext";

const ActiveCampaignsCard = () => {
  const { campaigns } = useCampaigns();
  return (
  <SectionCard
    title="Active Campaigns"
    action={
      <Link to="/campaigns" className="text-sm font-medium text-blue-600 hover:text-blue-700">
        View All
      </Link>
    }
    noPadding
  >
    <div className="divide-y divide-slate-100">
      {campaigns.slice(0, 4).map((campaign) => (
        <div
          key={campaign.id}
          className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h4 className="font-semibold text-slate-800 truncate">{campaign.name}</h4>
              <StatusBadge status={campaign.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Users size={14} /> {campaign.kols} KOLs
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={14} /> {campaign.budget}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> Ends {campaign.endDate}
              </span>
            </div>
          </div>
          <div className="w-full sm:w-32 flex flex-col gap-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Progress</span>
              <span>{campaign.progress}%</span>
            </div>
            <ProgressBar value={campaign.progress} />
          </div>
        </div>
      ))}
    </div>
  </SectionCard>
  );
};

export default ActiveCampaignsCard;
