import { useMemo, useState } from "react";
import KolFilters from "@/components/kols/KolFilters";
import KolGrid from "@/components/kols/KolGrid";
import PageHeader from "@/components/shared/PageHeader";
import { topKols } from "@/data/mockData";
import type { Platform } from "@/types";

const niches = Array.from(new Set(topKols.map((k) => k.niche)));

const KolsPage = () => {
  const [search, setSearch] = useState<string>("");
  const [platform, setPlatform] = useState<Platform | "All">("All");
  const [niche, setNiche] = useState<string>("All");

  const filtered = useMemo(() => {
    return topKols.filter((k) => {
      const matchPlatform = platform === "All" || k.platform === platform;
      const matchNiche = niche === "All" || k.niche === niche;
      const q = search.trim().toLowerCase();
      const matchSearch =
        q.length === 0 ||
        k.name.toLowerCase().includes(q) ||
        k.handle.toLowerCase().includes(q) ||
        k.niche.toLowerCase().includes(q);
      return matchPlatform && matchNiche && matchSearch;
    });
  }, [search, platform, niche]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="KOL Database"
        description="Discover, evaluate, and shortlist the right creators for every campaign."
      />
      <KolFilters
        search={search}
        onSearchChange={setSearch}
        platform={platform}
        onPlatformChange={setPlatform}
        niches={niches}
        niche={niche}
        onNicheChange={setNiche}
      />
      <KolGrid kols={filtered} />
    </div>
  );
};

export default KolsPage;
