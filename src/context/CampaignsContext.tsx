import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { seedCampaigns } from "@/data/mockData";
import { DEFAULT_PROMO_CODE_TEMPLATE } from "@/data/promoCode";
import { useSheets } from "@/context/SheetsContext";
import type {
  Campaign,
  CampaignAudience,
  CampaignDeliverable,
  CampaignFeeModel,
  CampaignQuestion,
  CampaignStatus,
  CampaignVariant,
  KolTier,
  Platform,
} from "@/types";

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
  /** Plain strings are accepted for convenience and normalised to deliverables. */
  deliverables: (string | CampaignDeliverable)[];
  // Targeting
  targetKolCount?: number;
  maxApplications?: number;
  platforms?: Platform[];
  kolTiers?: KolTier[];
  audience?: Partial<CampaignAudience>;
  // Schedule
  applicationDeadline?: string;
  postStartDate?: string;
  postEndDate?: string;
  // Product
  variants?: CampaignVariant[];
  // Content requirements
  mandatoryTags?: string[];
  mandatoryMentions?: string[];
  disclosureText?: string;
  // Money
  feeModel?: CampaignFeeModel;
  feePerKol?: number;
  commissionPct?: number;
  totalBudget?: number;
  feeDisplayEnabled?: boolean;
  feeDisplayText?: string;
  promoCodeTemplate?: string;
  promoCodeValue?: string;
  // Ops
  briefDocUrl?: string;
  storeIds?: string[];
  campaignCode?: string;
  language?: string;
  customQuestions?: CampaignQuestion[];
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

const DEFAULT_DISCLOSURE = "#廣告 Advertisement";
const DEFAULT_LANGUAGE = "en-HK";
const DEFAULT_TARGET_KOL_COUNT = 10;
const DEFAULT_MAX_APPLICATIONS = 50;

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

/** First 3 alphanumeric characters of the name, uppercased — e.g. "AGS". */
const deriveCampaignCode = (name: string): string => {
  const cleaned = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned.slice(0, 3) || "GEN";
};

/** Makes sure the code is unique across campaigns (AGS -> AGS2 -> AGS3). */
const uniqueCampaignCode = (base: string, existing: Campaign[]): string => {
  if (!existing.some((c) => c.campaignCode === base)) return base;
  let i = 2;
  while (existing.some((c) => c.campaignCode === `${base}${i}`)) i += 1;
  return `${base}${i}`;
};

const nextId = (existing: Campaign[]): number =>
  existing.length === 0 ? 1 : Math.max(...existing.map((c) => c.id)) + 1;

const toDeliverables = (
  input: (string | CampaignDeliverable)[],
  platform: Platform,
): CampaignDeliverable[] =>
  input
    .map((d) =>
      typeof d === "string"
        ? { platform, type: d.trim(), count: 1 }
        : { ...d, type: d.type.trim() },
    )
    .filter((d) => d.type.length > 0);

export const CampaignsProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);
  const { snapshot, push, remove: removeRemote, triggerBuild } = useSheets();
  const hydrated = useRef(false);

  // Seed from the sheet once, the first time a snapshot arrives. Later
  // refreshes do not clobber local edits — the sheet is the write target,
  // not a live read loop.
  useEffect(() => {
    if (hydrated.current || !snapshot) return;
    if (snapshot.campaigns.length > 0) setCampaigns(snapshot.campaigns);
    hydrated.current = true;
  }, [snapshot]);

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
        deliverables: toDeliverables(input.deliverables, input.platform),
        // Targeting
        targetKolCount: input.targetKolCount ?? input.kols ?? DEFAULT_TARGET_KOL_COUNT,
        maxApplications: input.maxApplications ?? DEFAULT_MAX_APPLICATIONS,
        platforms: input.platforms && input.platforms.length > 0 ? input.platforms : [input.platform],
        kolTiers: input.kolTiers ?? [],
        audience: {
          ageRange: input.audience?.ageRange ?? "18-34",
          genderSplit: input.audience?.genderSplit ?? "70% F / 30% M",
          interests: input.audience?.interests ?? [],
          region: input.audience?.region ?? input.region.trim(),
        },
        // Schedule
        applicationDeadline: input.applicationDeadline ?? input.endDate,
        postStartDate: input.postStartDate ?? input.endDate,
        postEndDate: input.postEndDate ?? input.endDate,
        // Product
        variants: input.variants ?? [],
        // Content requirements
        mandatoryTags: input.mandatoryTags ?? [],
        mandatoryMentions: input.mandatoryMentions ?? ["@fxcreations"],
        disclosureText: input.disclosureText ?? DEFAULT_DISCLOSURE,
        // Money
        feeModel: input.feeModel ?? "gift",
        feePerKol: input.feePerKol ?? 0,
        commissionPct: input.commissionPct ?? 0,
        totalBudget: input.totalBudget ?? 0,
        // Fee visibility — off by default so a gifting campaign never makes a
        // KOL wonder whether cash is on the table.
        feeDisplayEnabled: input.feeDisplayEnabled ?? false,
        feeDisplayText: input.feeDisplayText?.trim() ?? "",
        // Promo code — set by the campaign owner
        promoCodeTemplate:
          input.promoCodeTemplate ?? DEFAULT_PROMO_CODE_TEMPLATE,
        promoCodeValue: input.promoCodeValue?.trim() ?? "",
        // Ops
        briefDocUrl: input.briefDocUrl?.trim() || undefined,
        storeIds: input.storeIds ?? [],
        campaignCode: uniqueCampaignCode(
          input.campaignCode?.trim().toUpperCase() || deriveCampaignCode(input.name),
          campaigns,
        ),
        language: input.language ?? DEFAULT_LANGUAGE,
        customQuestions: input.customQuestions ?? [],
        updatedAt: new Date().toISOString(),
      };
      setCampaigns((prev) => [created, ...prev]);
      push("campaigns", created);
      // A new campaign needs its own static link-preview page — the build
      // hook regenerates those.
      triggerBuild();
      return created;
    },
    [campaigns, push, triggerBuild],
  );

  const updateCampaign = useCallback(
    (id: number, partial: Partial<Campaign>) => {
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
          // The campaign code feeds the promo codes, so it has to stay unique
          // across campaigns — the campaign being edited is excluded from the
          // check (same rule as `addCampaign`).
          if (typeof partial.campaignCode === "string") {
            const base = partial.campaignCode.trim().toUpperCase();
            next.campaignCode = base
              ? uniqueCampaignCode(base, prev.filter((x) => x.id !== id))
              : c.campaignCode;
          }
          next.updatedAt = new Date().toISOString();
          return next;
        }),
      );
      const current = campaigns.find((c) => c.id === id);
      if (current) {
        push("campaigns", {
          ...current,
          ...partial,
          updatedAt: new Date().toISOString(),
        });
      }
    },
    [campaigns, push],
  );

  const deleteCampaign = useCallback(
    (id: number) => {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      removeRemote("campaigns", id);
    },
    [removeRemote],
  );

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
        campaignCode: uniqueCampaignCode(deriveCampaignCode(copyName), campaigns),
        updatedAt: new Date().toISOString(),
      };
      setCampaigns((prev) => [dup, ...prev]);
      push("campaigns", dup);
      triggerBuild();
      return dup;
    },
    [campaigns, push, triggerBuild],
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
