import { MapPin, Star, History } from "lucide-react";
import type { Kol } from "@/types";
import PlatformBadge from "@/components/shared/PlatformBadge";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatFollowers } from "@/data/seedKols";

interface KolCardProps {
  kol: Kol;
  onOpenProfile: (kol: Kol) => void;
}

const tierStyles: Record<Kol["tier"], string> = {
  Nano: "bg-slate-100 text-slate-700 border-slate-200",
  Micro: "bg-sky-50 text-sky-700 border-sky-200",
  Mid: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Macro: "bg-violet-50 text-violet-700 border-violet-200",
  Mega: "bg-amber-50 text-amber-700 border-amber-200",
};

const sourceLabels: Record<Kol["source"], string> = {
  fb_group: "FB group",
  referral: "Referral",
  inbound: "Inbound",
  event: "Event",
  other: "Other",
};

const KolCard = ({ kol, onOpenProfile }: KolCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col">
    <div className="flex items-start gap-4 mb-4">
      <img
        src={kol.avatar}
        alt={kol.name}
        className="w-14 h-14 rounded-full border border-slate-200"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 truncate">{kol.name}</h4>
        <p className="text-xs text-slate-500 truncate">@{kol.handle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded border ${tierStyles[kol.tier]}`}
          >
            {kol.tier}
          </span>
          <StatusBadge status={kol.status} />
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-100 flex-shrink-0">
        {kol.rating}
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 mb-4">
      <PlatformBadge platform={kol.primaryPlatform} />
      {kol.platforms
        .filter((p) => p !== kol.primaryPlatform)
        .map((p) => (
          <span
            key={p}
            className="px-2 py-0.5 text-xs font-medium rounded border border-slate-200 text-slate-500"
          >
            {p}
          </span>
        ))}
      <span className="text-xs text-slate-500 flex items-center gap-1">
        <MapPin size={12} /> {kol.region}
      </span>
    </div>

    {kol.niches.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 mb-4">
        {kol.niches.map((niche) => (
          <span
            key={niche}
            className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600"
          >
            {niche}
          </span>
        ))}
      </div>
    ) : null}

    <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-4 mb-4">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Followers</p>
        <p className="font-semibold text-slate-800 text-sm">
          {formatFollowers(kol.followers)}
        </p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Eng. Rate</p>
        <p className="font-semibold text-emerald-600 text-sm">{kol.er}%</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Rate card</p>
        <p className="font-semibold text-slate-800 text-sm">{kol.rateCard}</p>
      </div>
    </div>

    <div className="flex items-center justify-between mt-auto gap-2">
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 min-w-0">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <span className="truncate">{sourceLabels[kol.source]}</span>
      </span>
      <button
        type="button"
        onClick={() => onOpenProfile(kol)}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800"
      >
        <History size={12} /> Post history
      </button>
    </div>
  </div>
);

export default KolCard;
