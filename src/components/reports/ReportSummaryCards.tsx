import { TrendingUp } from "lucide-react";
import { reportSummary } from "@/data/mockData";

const ReportSummaryCards = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    {reportSummary.map((item) => (
      <div
        key={item.label}
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
      >
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {item.label}
        </p>
        <p className="text-xl font-bold text-slate-800 mt-1">{item.value}</p>
        <span
          className={`inline-flex items-center text-xs font-medium mt-1 ${
            item.isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {item.change}
          <TrendingUp
            size={12}
            className={`ml-1 ${item.isPositive ? "" : "transform rotate-180"}`}
          />
        </span>
      </div>
    ))}
  </div>
);

export default ReportSummaryCards;
