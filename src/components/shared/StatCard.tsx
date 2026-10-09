import { TrendingUp } from "lucide-react";
import type { KpiStat } from "@/types";

const StatCard = ({ title, value, change, isPositive, icon: Icon, color, bg }: KpiStat) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <span
        className={`inline-flex items-center text-sm font-medium ${
          isPositive ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {change}
        <TrendingUp
          size={16}
          className={`ml-1 ${isPositive ? "" : "transform rotate-180"}`}
        />
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

export default StatCard;
