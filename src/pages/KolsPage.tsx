import { useMemo, useState } from "react";
import KolFilters from "@/components/kols/KolFilters";
import KolGrid from "@/components/kols/KolGrid";
import KolProfileDialog from "@/components/kols/KolProfileDialog";
import PageHeader from "@/components/shared/PageHeader";
import { useKol } from "@/context/KolContext";
import type { Kol, KolTier, Platform } from "@/types";

const KolsPage = () => {
  const { kols } = useKol();
  const [search, setSearch] = useState<string>("");
  const [platform, setPlatform] = useState<Platform | "All">("All");
  const [niche, setNiche] = useState<string>("All");
  const [tier, setTier] = useState<KolTier | "All">("All");
  const [profile, setProfile] = useState<Kol | null>(null);

  const niches = useMemo(
    () => Array.from(new Set(kols.flatMap((k) => k.niches))).sort(),
    [kols],
  );

  const filtered = useMemo(() => {
    return kols.filter((k) => {
      const matchPlatform =
        platform === "All" || k.platforms.includes(platform) || k.primaryPlatform === platform;
      const matchNiche = niche === "All" || k.niches.includes(niche);
      const matchTier = tier === "All" || k.tier === tier;
      const q = search.trim().toLowerCase();
      const matchSearch =
        q.length === 0 ||
        k.name.toLowerCase().includes(q) ||
        k.handle.toLowerCase().includes(q) ||
        k.niches.some((n) => n.toLowerCase().includes(q)) ||
        k.tags.some((t) => t.toLowerCase().includes(q));
      return matchPlatform && matchNiche && matchTier && matchSearch;
    });
  }, [kols, search, platform, niche, tier]);

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
        tier={tier}
        onTierChange={setTier}
      />
      <KolGrid kols={filtered} onOpenProfile={setProfile} />
      {profile ? <KolProfileDialog kol={profile} onClose={() => setProfile(null)} /> : null}
    </div>
  );
};

export default KolsPage;
