import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import type { Platform } from "@/types";

export const ALL_PLATFORMS: readonly (Platform | "All")[] = [
  "All",
  "Instagram",
  "TikTok",
  "Xiaohongshu",
  "YouTube",
] as const;

interface KolFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  platform: Platform | "All";
  onPlatformChange: (p: Platform | "All") => void;
  niches: readonly string[];
  niche: string;
  onNicheChange: (n: string) => void;
}

const KolFilters = ({
  search,
  onSearchChange,
  platform,
  onPlatformChange,
  niches,
  niche,
  onNicheChange,
}: KolFiltersProps) => (
  <div className="flex flex-col gap-4 mb-6">
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
          placeholder="Search KOLs by name or handle..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <SlidersHorizontal size={16} /> Advanced
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          <UserPlus size={16} /> Add KOL
        </button>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Platform:</span>
      {ALL_PLATFORMS.map((p) => {
        const active = platform === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPlatformChange(p)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
              active
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        );
      })}
    </div>

    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Niche:</span>
      {["All", ...niches].map((n) => {
        const active = niche === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onNicheChange(n)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
              active
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  </div>
);

export default KolFilters;
