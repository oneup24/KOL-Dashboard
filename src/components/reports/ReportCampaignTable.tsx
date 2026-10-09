import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import PlatformBadge from "@/components/shared/PlatformBadge";
import SectionCard from "@/components/shared/SectionCard";
import StatusBadge from "@/components/shared/StatusBadge";
import type { Campaign, Platform } from "@/types";

interface CampaignRoiRow {
  id: number;
  name: string;
  status: Campaign["status"];
  platform: Platform;
  spend: string;
  revenue: string;
  roi: number;
}

const roiData: CampaignRoiRow[] = [
  {
    id: 1,
    name: "Summer Collection Launch",
    status: "Active",
    platform: "Instagram",
    spend: "$15,000",
    revenue: "$58,200",
    roi: 288,
  },
  {
    id: 2,
    name: "AGS Pro Backpack Review",
    status: "Planning",
    platform: "YouTube",
    spend: "$8,000",
    revenue: "$21,400",
    roi: 167,
  },
  {
    id: 3,
    name: "Back to School Promo",
    status: "Completed",
    platform: "TikTok",
    spend: "$25,000",
    revenue: "$96,000",
    roi: 284,
  },
  {
    id: 5,
    name: "Q4 Brand Awareness",
    status: "Active",
    platform: "Instagram",
    spend: "$18,500",
    revenue: "$46,300",
    roi: 150,
  },
  {
    id: 4,
    name: "Holiday Gift Guide",
    status: "Draft",
    platform: "Xiaohongshu",
    spend: "$30,000",
    revenue: "—",
    roi: 0,
  },
];

const ReportCampaignTable = () => (
  <SectionCard
    title="Campaign ROI"
    description="Return on ad spend by campaign, sorted by ROI."
    noPadding
  >
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">Campaign</th>
            <th className="px-6 py-3 text-left font-semibold">Status</th>
            <th className="px-6 py-3 text-left font-semibold">Platform</th>
            <th className="px-6 py-3 text-right font-semibold">Spend</th>
            <th className="px-6 py-3 text-right font-semibold">Revenue</th>
            <th className="px-6 py-3 text-right font-semibold">ROI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {roiData.map((row) => {
            const isPositive = row.roi >= 200;
            return (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4">
                  <PlatformBadge platform={row.platform} />
                </td>
                <td className="px-6 py-4 text-right text-slate-700">{row.spend}</td>
                <td className="px-6 py-4 text-right text-slate-700">{row.revenue}</td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      row.roi === 0
                        ? "text-slate-400"
                        : isPositive
                          ? "text-emerald-600"
                          : "text-amber-600"
                    }`}
                  >
                    {row.roi === 0 ? "—" : `${row.roi}%`}
                    {row.roi > 0 ? (
                      isPositive ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )
                    ) : null}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </SectionCard>
);

export default ReportCampaignTable;
