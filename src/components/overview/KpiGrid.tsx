import StatCard from "@/components/shared/StatCard";
import { kpiData } from "@/data/mockData";

const KpiGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {kpiData.map((stat) => (
      <StatCard key={stat.title} {...stat} />
    ))}
  </div>
);

export default KpiGrid;
