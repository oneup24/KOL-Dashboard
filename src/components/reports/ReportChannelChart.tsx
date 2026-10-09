import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SectionCard from "@/components/shared/SectionCard";
import { reportChannelData } from "@/data/mockData";

const ReportChannelChart = () => (
  <SectionCard title="Channel Performance" description="Spend vs. attributed revenue by platform.">
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={reportChannelData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="channel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip
            formatter={(v: number) => `$${v.toLocaleString()}`}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Bar dataKey="spend" name="Spend" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </SectionCard>
);

export default ReportChannelChart;
