import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedCampaigns } from "@/data/mockData";
import type { Campaign, CampaignStatus, Platform } from "@/types";

export interface NewCampaignInput {
  name: string;
  status: CampaignStatus;
  platform: Platform;
  region: string;
  manager: string;
  endDate: string;
  budget: string;
  progress?: number;
  kols?: number;
  productName: string;
  productUrl: string;
  productImage: string;
  productDescription: string;
  campaignBrief: string;
  requirements: string[];
  deliverables: string[];
  promoCode?: string;
}

interface CampaignsContextValue {
  campaigns: Campaign[];
  addCampaign: (input: NewCampaignInput) => Campaign;
  updateCampaign: (id: number, partial: Partial<Campaign>) => void;
  deleteCampaign: (id: number) => void;
  duplicateCampaign: (id: number) => Campaign | null;
  getById: (id: number) => Campaign | undefined;
  getBySlug: (slug: string) => Campaign | undefined;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const uniqueSlug = (base: string, existing: Campaign[]): string => {
  if (!existing.some((c) => c.slug === base)) return base || `campaign-${Date.now()}`;
  let i = 2;
  while (existing.some((c) => c.slug === `${base}-${i}`)) i += 1;
  return `${base}-${i}`;
};

const nextId = (existing: Campaign[]): number =>
  existing.length === 0 ? 1 : Math.max(...existing.map((c) => c.id)) + 1;

export const CampaignsProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);

  const addCampaign = useCallback(
    (input: NewCampaignInput): Campaign => {
      const base = slugify(input.name) || `campaign-${Date.now()}`;
      const slug = uniqueSlug(base, campaigns);
      const created: Campaign = {
        id: nextId(campaigns),
        slug,
        name: input.name.trim(),
        status: input.status,
        progress: input.progress ?? 0,
        kols: input.kols ?? 0,
        budget: input.budget.trim(),
        endDate: input.endDate,
        platform: input.platform,
        manager: input.manager.trim(),
        region: input.region.trim(),
        productName: input.productName.trim(),
        productUrl: input.productUrl.trim(),
        productImage:
          input.productImage.trim() ||
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
        productDescription: input.productDescription.trim(),
        campaignBrief: input.campaignBrief.trim(),
        requirements: input.requirements.filter((r) => r.trim()),
        deliverables: input.deliverables.filter((d) => d.trim()),
        promoCode: input.promoCode?.trim() || undefined,
      };
      setCampaigns((prev) => [created, ...prev]);
      return created;
    },
    [campaigns],
  );

  const updateCampaign = useCallback((id: number, partial: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...partial };
        // Re-slug if name changed (preserves URL continuity for old slugs in
        // the wild — only when name actually changed)
        if (partial.name && partial.name !== c.name) {
          const base = slugify(partial.name);
          if (base) next.slug = uniqueSlug(base, prev.filter((x) => x.id !== id));
        }
        return next;
      }),
    );
  }, []);

  const deleteCampaign = useCallback((id: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const duplicateCampaign = useCallback(
    (id: number): Campaign | null => {
      const source = campaigns.find((c) => c.id === id);
      if (!source) return null;
      const copyName = `${source.name} (Copy)`;
      const base = slugify(copyName) || `campaign-${Date.now()}`;
      const slug = uniqueSlug(base, campaigns);
      const dup: Campaign = {
        ...source,
        id: nextId(campaigns),
        name: copyName,
        slug,
        status: "Draft",
        progress: 0,
        kols: 0,
      };
      setCampaigns((prev) => [dup, ...prev]);
      return dup;
    },
    [campaigns],
  );

  const getById = useCallback(
    (id: number) => campaigns.find((c) => c.id === id),
    [campaigns],
  );

  const getBySlug = useCallback(
    (slug: string) => campaigns.find((c) => c.slug === slug),
    [campaigns],
  );

  const value = useMemo(
    () => ({ campaigns, addCampaign, updateCampaign, deleteCampaign, duplicateCampaign, getById, getBySlug }),
    [campaigns, addCampaign, updateCampaign, deleteCampaign, duplicateCampaign, getById, getBySlug],
  );

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
};

export const useCampaigns = (): CampaignsContextValue => {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error("useCampaigns must be used within a CampaignsProvider");
  return ctx;
};
