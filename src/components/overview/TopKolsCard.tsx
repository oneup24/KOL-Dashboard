import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import SectionCard from "@/components/shared/SectionCard";
import { topKols } from "@/data/mockData";

const TopKolsCard = () => (
  <SectionCard
    title="Top Performing KOLs"
    action={
      <Link to="/kols" className="text-sm font-medium text-blue-600 hover:text-blue-700">
        Database
      </Link>
    }
    noPadding
  >
    <div className="divide-y divide-slate-100">
      {topKols.slice(0, 4).map((kol) => (
        <div
          key={kol.id}
          className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={kol.avatar}
              alt={kol.name}
              className="w-10 h-10 rounded-full border border-slate-200"
            />
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-800 flex items-center gap-1">
                {kol.name} <CheckCircle size={14} className="text-blue-500" />
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {kol.handle} • {kol.platform}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-right">
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 mb-0.5">Followers</p>
              <p className="font-semibold text-slate-800">{kol.followers}</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 mb-0.5">Eng. Rate</p>
              <p className="font-semibold text-emerald-600">{kol.er}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Score</p>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-100">
                {kol.score}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </SectionCard>
);

export default TopKolsCard;
