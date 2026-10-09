import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Filter } from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";
import { performanceData } from "@/data/mockData";

const PerformanceTrendsChart = () => (
  <SectionCard
    title="Performance Trends"
    noPadding
    className="lg:col-span-2"
    action={
      <button
        type="button"
        className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
      >
        Filter <Filter size={14} />
      </button>
    }
  >
    <div className="p-6">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            />
            <Area
              type="monotone"
              dataKey="reach"
              name="Total Reach"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorReach)"
            />
            <Area
              type="monotone"
              dataKey="engagement"
              name="Engagement"
              stroke="#ec4899"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorEngagement)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </SectionCard>
);

export default PerformanceTrendsChart;
