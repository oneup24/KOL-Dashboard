import { Bookmark, CheckCircle, MapPin, Star } from "lucide-react";
import type { Kol } from "@/types";
import PlatformBadge from "@/components/shared/PlatformBadge";

interface KolCardProps {
  kol: Kol;
}

const KolCard = ({ kol }: KolCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col">
    <div className="flex items-start gap-4 mb-4">
      <img
        src={kol.avatar}
        alt={kol.name}
        className="w-14 h-14 rounded-full border border-slate-200"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 flex items-center gap-1">
          {kol.name} <CheckCircle size={14} className="text-blue-500" />
        </h4>
        <p className="text-xs text-slate-500 truncate">{kol.handle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <PlatformBadge platform={kol.platform} />
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin size={12} /> {kol.region}
          </span>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-100 flex-shrink-0">
        {kol.score}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-4 mb-4">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Followers</p>
        <p className="font-semibold text-slate-800 text-sm">{kol.followers}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Eng. Rate</p>
        <p className="font-semibold text-emerald-600 text-sm">{kol.er}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Avg. Fee</p>
        <p className="font-semibold text-slate-800 text-sm">{kol.averageFee}</p>
      </div>
    </div>

    <div className="flex items-center justify-between mt-auto">
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Star size={12} className="text-amber-400 fill-amber-400" /> {kol.niche}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Save to watchlist"
          className="p-1.5 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
        >
          <Bookmark size={16} />
        </button>
        <button
          type="button"
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800"
        >
          Invite
        </button>
      </div>
    </div>
  </div>
);

export default KolCard;
