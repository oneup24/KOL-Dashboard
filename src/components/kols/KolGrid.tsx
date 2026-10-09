import KolCard from "@/components/kols/KolCard";
import EmptyState from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import type { Kol } from "@/types";

interface KolGridProps {
  kols: Kol[];
}

const KolGrid = ({ kols }: KolGridProps) => {
  if (kols.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No KOLs match your filters"
        description="Try clearing a filter or searching by a different keyword."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {kols.map((kol) => (
        <KolCard key={kol.id} kol={kol} />
      ))}
    </div>
  );
};

export default KolGrid;
