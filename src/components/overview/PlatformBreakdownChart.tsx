import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import SectionCard from "@/components/shared/SectionCard";
import { CHART_COLORS, platformData } from "@/data/mockData";

const PlatformBreakdownChart = () => (
  <SectionCard title="Platform Breakdown">
    <div className="h-60 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={platformData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {platformData.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-800">100%</span>
        <span className="text-xs text-slate-500">Total Spend</span>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2">
      {platformData.map((entry, index) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: CHART_COLORS[index] }}
          />
          <span className="text-slate-600">{entry.name}</span>
          <span className="font-semibold text-slate-800 ml-auto">{entry.value}%</span>
        </div>
      ))}
    </div>
  </SectionCard>
);

export default PlatformBreakdownChart;
