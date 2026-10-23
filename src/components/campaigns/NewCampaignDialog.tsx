import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  Info,
  ListChecks,
  Package,
  Plus,
  Save,
  Target,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useCampaigns } from "@/context/CampaignsContext";
import { stores } from "@/data/stores";
import type {
  Campaign,
  CampaignAudience,
  CampaignDeliverable,
  CampaignFeeModel,
  CampaignStatus,
  CampaignVariant,
  KolTier,
  Platform,
} from "@/types";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; campaign: Campaign };

interface NewCampaignDialogProps {
  mode: Mode | null;
  onClose: () => void;
}

const statusOptions: CampaignStatus[] = ["Active", "Planning", "Completed", "Draft"];
const platformOptions: Platform[] = ["Instagram", "TikTok", "Xiaohongshu", "YouTube"];
const tierOptions: KolTier[] = ["Nano", "Micro", "Mid", "Macro", "Mega"];
const feeModelOptions: { value: CampaignFeeModel; label: string }[] = [
  { value: "gift", label: "Gift only" },
  { value: "flat", label: "Flat fee per KOL" },
  { value: "commission", label: "Commission only" },
  { value: "flat_commission", label: "Flat fee + commission" },
];

type TabId = "basics" | "product" | "schedule" | "targeting" | "requirements" | "money";

const tabs: { id: TabId; label: string; icon: typeof Info }[] = [
  { id: "basics", label: "Basics", icon: Info },
  { id: "product", label: "Product", icon: Package },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "targeting", label: "Targeting", icon: Target },
  { id: "requirements", label: "Requirements", icon: ListChecks },
  { id: "money", label: "Money", icon: Wallet },
];

interface FormState {
  name: string;
  manager: string;
  region: string;
  budget: string;
  status: CampaignStatus;
  platforms: Platform[];
  campaignCode: string;
  endDate: string;
  productName: string;
  productUrl: string;
  productImage: string;
  productDescription: string;
  campaignBrief: string;
  variants: CampaignVariant[];
  applicationDeadline: string;
  postStartDate: string;
  postEndDate: string;
  targetKolCount: string;
  maxApplications: string;
  kolTiers: KolTier[];
  ageRange: string;
  genderSplit: string;
  interests: string;
  audienceRegion: string;
  deliverables: CampaignDeliverable[];
  requirementsText: string;
  mandatoryTags: string;
  mandatoryMentions: string;
  disclosureText: string;
  briefDocUrl: string;
  storeIds: string[];
  feeModel: CampaignFeeModel;
  feePerKol: string;
  commissionPct: string;
  totalBudget: string;
}

const blank: FormState = {
  name: "",
  manager: "",
  region: "HK",
  budget: "",
  status: "Draft",
  platforms: ["Instagram"],
  campaignCode: "",
  endDate: "",
  productName: "",
  productUrl: "",
  productImage: "",
  productDescription: "",
  campaignBrief: "",
  variants: [],
  applicationDeadline: "",
  postStartDate: "",
  postEndDate: "",
  targetKolCount: "10",
  maxApplications: "50",
  kolTiers: [],
  ageRange: "18-34",
  genderSplit: "70% F / 30% M",
  interests: "",
  audienceRegion: "HK",
  deliverables: [],
  requirementsText: "",
  mandatoryTags: "",
  mandatoryMentions: "@fxcreations",
  disclosureText: "#廣告 Advertisement",
  briefDocUrl: "",
  storeIds: [],
  feeModel: "gift",
  feePerKol: "0",
  commissionPct: "0",
  totalBudget: "0",
};

const toForm = (c: Campaign): FormState => ({
  name: c.name,
  manager: c.manager,
  region: c.region,
  budget: c.budget,
  status: c.status,
  platforms: c.platforms.length > 0 ? c.platforms : [c.platform],
  campaignCode: c.campaignCode,
  endDate: c.endDate,
  productName: c.productName,
  productUrl: c.productUrl,
  productImage: c.productImage,
  productDescription: c.productDescription,
  campaignBrief: c.campaignBrief,
  variants: c.variants.map((v) => ({ ...v, stockByStore: { ...v.stockByStore } })),
  applicationDeadline: c.applicationDeadline,
  postStartDate: c.postStartDate,
  postEndDate: c.postEndDate,
  targetKolCount: String(c.targetKolCount),
  maxApplications: String(c.maxApplications),
  kolTiers: [...c.kolTiers],
  ageRange: c.audience.ageRange,
  genderSplit: c.audience.genderSplit,
  interests: c.audience.interests.join(", "),
  audienceRegion: c.audience.region,
  deliverables: c.deliverables.map((d) => ({ ...d })),
  requirementsText: c.requirements.join("\n"),
  mandatoryTags: c.mandatoryTags.join(", "),
  mandatoryMentions: c.mandatoryMentions.join(", "),
  disclosureText: c.disclosureText,
  briefDocUrl: c.briefDocUrl ?? "",
  storeIds: [...c.storeIds],
  feeModel: c.feeModel,
  feePerKol: String(c.feePerKol),
  commissionPct: String(c.commissionPct),
  totalBudget: String(c.totalBudget),
});

/** The exact shape written to the campaigns context. */
interface CampaignFields {
  name: string;
  status: CampaignStatus;
  platform: Platform;
  region: string;
  manager: string;
  endDate: string;
  budget: string;
  productName: string;
  productUrl: string;
  productImage: string;
  productDescription: string;
  campaignBrief: string;
  requirements: string[];
  deliverables: CampaignDeliverable[];
  targetKolCount: number;
  maxApplications: number;
  platforms: Platform[];
  kolTiers: KolTier[];
  audience: CampaignAudience;
  applicationDeadline: string;
  postStartDate: string;
  postEndDate: string;
  variants: CampaignVariant[];
  mandatoryTags: string[];
  mandatoryMentions: string[];
  disclosureText: string;
  feeModel: CampaignFeeModel;
  feePerKol: number;
  commissionPct: number;
  totalBudget: number;
  briefDocUrl?: string;
  storeIds: string[];
  campaignCode: string;
}

const listFromText = (text: string): string[] =>
  text
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);

const toNumber = (raw: string): number => {
  const value = Number(raw.trim().replace(/,/g, ""));
  return Number.isFinite(value) ? value : 0;
};

const NewCampaignDialog = ({ mode, onClose }: NewCampaignDialogProps) => {
  const { addCampaign, updateCampaign } = useCampaigns();
  const uid = useId();
  // Seeded lazily so a dialog that mounts straight into "edit" mode is
  // pre-filled on the very first render (no flash of an empty form).
  const [form, setForm] = useState<FormState>(() =>
    mode?.kind === "edit" ? toForm(mode.campaign) : blank,
  );
  const [tab, setTab] = useState<TabId>("basics");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!mode) return;
    setError(null);
    setTab("basics");
    setForm(mode.kind === "edit" ? toForm(mode.campaign) : blank);
  }, [mode]);

  // The values the form started with — used to detect unsaved work.
  const initialForm = useMemo<FormState>(
    () => (mode?.kind === "edit" ? toForm(mode.campaign) : blank),
    [mode],
  );
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  /**
   * Closing a long form throws away everything that was typed, so the
   * marketer is asked first — but only when something actually changed.
   */
  const requestClose = useCallback(() => {
    if (
      dirty &&
      !window.confirm("You have unsaved changes. Discard them and close the dialog?")
    ) {
      return;
    }
    onClose();
  }, [dirty, onClose]);

  // Escape closes the dialog (with the same guard as the Cancel button).
  useEffect(() => {
    if (!mode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        requestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, requestClose]);

  if (!mode) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const buildFields = (): CampaignFields => ({
    name: form.name.trim(),
    status: form.status,
    platform: form.platforms[0] ?? "Instagram",
    region: form.region.trim(),
    manager: form.manager.trim(),
    endDate: form.endDate,
    budget: form.budget.trim(),
    productName: form.productName.trim(),
    productUrl: form.productUrl.trim(),
    productImage: form.productImage.trim(),
    productDescription: form.productDescription.trim(),
    campaignBrief: form.campaignBrief.trim(),
    requirements: listFromText(form.requirementsText),
    deliverables: form.deliverables
      .filter((d) => d.type.trim().length > 0)
      .map((d) => ({ ...d, type: d.type.trim() })),
    targetKolCount: toNumber(form.targetKolCount),
    maxApplications: toNumber(form.maxApplications),
    platforms: form.platforms.length > 0 ? form.platforms : ["Instagram"],
    kolTiers: form.kolTiers,
    audience: {
      ageRange: form.ageRange.trim(),
      genderSplit: form.genderSplit.trim(),
      interests: listFromText(form.interests),
      region: form.audienceRegion.trim(),
    },
    applicationDeadline: form.applicationDeadline,
    postStartDate: form.postStartDate,
    postEndDate: form.postEndDate,
    variants: form.variants,
    mandatoryTags: listFromText(form.mandatoryTags),
    mandatoryMentions: listFromText(form.mandatoryMentions),
    disclosureText: form.disclosureText.trim(),
    feeModel: form.feeModel,
    feePerKol: toNumber(form.feePerKol),
    commissionPct: toNumber(form.commissionPct),
    totalBudget: toNumber(form.totalBudget),
    briefDocUrl: form.briefDocUrl.trim() || undefined,
    storeIds: form.storeIds,
    campaignCode: form.campaignCode.trim().toUpperCase(),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.endDate.trim() || !form.productName.trim()) {
      setError("Campaign name, end date, and product name are required.");
      return;
    }
    const code = form.campaignCode.trim().toUpperCase();
    if (code && !/^[A-Z0-9]{2,4}$/.test(code)) {
      setError("Campaign code must be 2–4 letters or digits (e.g. AGS).");
      return;
    }
    setSaving(true);
    const fields = buildFields();
    try {
      if (mode.kind === "create") {
        addCampaign(fields);
      } else {
        updateCampaign(mode.campaign.id, fields);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save campaign.");
    } finally {
      setSaving(false);
    }
  };

  const isEdit = mode.kind === "edit";

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      {/*
        No backdrop-click-to-close here: this is a long form and a stray
        click would silently discard every field.
      */}
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 id={`${uid}-title`} className="text-lg font-bold text-slate-800">
              {isEdit ? "Edit campaign" : "New campaign"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? "Update details. The public link slug may change if the campaign name changes."
                : "We'll generate a /c/:slug link you can share with KOLs."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={requestClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-shrink-0 border-b border-slate-100 px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin -mb-px">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    active
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
          {tab === "basics" ? (
            <Section title="Basics">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Campaign name"
                  required
                  value={form.name}
                  onChange={(v) => update("name", v)}
                  placeholder="e.g. Holiday Gift Guide 2026"
                />
                <Field
                  label="Manager"
                  value={form.manager}
                  onChange={(v) => update("manager", v)}
                  placeholder="Alice Wong"
                />
                <Field
                  label="Region"
                  value={form.region}
                  onChange={(v) => update("region", v)}
                  placeholder="HK / TW / CN"
                />
                <Field
                  label="Budget"
                  value={form.budget}
                  onChange={(v) => update("budget", v)}
                  placeholder="$10,000"
                />
                <Field
                  label="Campaign code"
                  hint="2–4 chars, used in promo codes"
                  value={form.campaignCode}
                  onChange={(v) => update("campaignCode", v.toUpperCase())}
                  placeholder="AGS"
                />
                <Field
                  label="End date"
                  required
                  type="date"
                  value={form.endDate}
                  onChange={(v) => update("endDate", v)}
                />
                <div>
                  <Label required htmlFor={`${uid}-status`}>
                    Status
                  </Label>
                  <select
                    id={`${uid}-status`}
                    required
                    value={form.status}
                    onChange={(e) => update("status", e.target.value as CampaignStatus)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label id={`${uid}-platforms`}>Platforms</Label>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-labelledby={`${uid}-platforms`}
                  >
                    {platformOptions.map((p) => {
                      const active = form.platforms.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => update("platforms", toggle(form.platforms, p))}
                          className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                            active
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    The first selected platform is used as the campaign&apos;s primary channel.
                  </p>
                </div>
              </div>
              <p className="mt-4 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-500">
                Promo codes are generated automatically per KOL when you approve an application
                (format{" "}
                <span className="font-mono text-slate-600">{"FX-{CAMPAIGN_CODE}-{KOL}"}</span>
                ). Set the campaign code above.
              </p>
            </Section>
          ) : null}

          {tab === "product" ? (
            <Section title="Product">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Product name"
                  required
                  value={form.productName}
                  onChange={(v) => update("productName", v)}
                  placeholder="AGS Pro Backpack — Sand"
                />
                <Field
                  label="Product URL"
                  value={form.productUrl}
                  onChange={(v) => update("productUrl", v)}
                  placeholder="https://fxcreations.com/..."
                  type="url"
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Product image URL"
                    value={form.productImage}
                    onChange={(v) => update("productImage", v)}
                    placeholder="https://images.unsplash.com/..."
                    type="url"
                  />
                  {form.productImage ? (
                    <img
                      src={form.productImage}
                      alt="Preview"
                      className="mt-2 w-full h-32 object-cover rounded-lg border border-slate-100"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`${uid}-product-description`}>
                    Product description
                  </Label>
                  <textarea
                    id={`${uid}-product-description`}
                    rows={3}
                    value={form.productDescription}
                    onChange={(e) => update("productDescription", e.target.value)}
                    placeholder="One-paragraph product pitch shown on the public page."
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`${uid}-campaign-brief`}>Campaign brief</Label>
                  <textarea
                    id={`${uid}-campaign-brief`}
                    rows={3}
                    value={form.campaignBrief}
                    onChange={(e) => update("campaignBrief", e.target.value)}
                    placeholder="What should the KOL actually do? Tone, scenes, audience."
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Variants
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      update("variants", [
                        ...form.variants,
                        {
                          id: `variant-${Date.now().toString(36)}`,
                          label: "",
                          sku: "",
                          stockByStore: {},
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    <Plus size={14} /> Add variant
                  </button>
                </div>
                {form.variants.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No variants yet — add one so the store can prepare the right SKU.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.variants.map((variant, index) => (
                      <div
                        key={variant.id}
                        className="border border-slate-200 rounded-lg p-3 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field
                            label="Label"
                            value={variant.label}
                            onChange={(v) =>
                              update(
                                "variants",
                                form.variants.map((x, i) =>
                                  i === index ? { ...x, label: v } : x,
                                ),
                              )
                            }
                            placeholder="AGS Pro — Sand"
                          />
                          <Field
                            label="SKU"
                            value={variant.sku ?? ""}
                            onChange={(v) =>
                              update(
                                "variants",
                                form.variants.map((x, i) =>
                                  i === index ? { ...x, sku: v } : x,
                                ),
                              )
                            }
                            placeholder="FX-AGS-SND-28"
                          />
                        </div>
                        <div>
                          <Label hint="Units held per store">Stock</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {stores.map((store) => (
                              <div key={store.id}>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                                  {store.district}
                                </p>
                                <input
                                  id={`${uid}-variant-${index}-stock-${store.id}`}
                                  type="number"
                                  min={0}
                                  aria-label={`${store.district} stock for ${variant.label || "variant"}`}
                                  value={variant.stockByStore[store.id] ?? 0}
                                  onChange={(e) =>
                                    update(
                                      "variants",
                                      form.variants.map((x, i) =>
                                        i === index
                                          ? {
                                              ...x,
                                              stockByStore: {
                                                ...x.stockByStore,
                                                [store.id]: toNumber(e.target.value),
                                              },
                                            }
                                          : x,
                                      ),
                                    )
                                  }
                                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              update(
                                "variants",
                                form.variants.filter((_, i) => i !== index),
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700"
                          >
                            <Trash2 size={14} /> Remove variant
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          ) : null}

          {tab === "schedule" ? (
            <Section title="Schedule">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field
                  label="Application deadline"
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(v) => update("applicationDeadline", v)}
                />
                <Field
                  label="Post start date"
                  type="date"
                  value={form.postStartDate}
                  onChange={(v) => update("postStartDate", v)}
                />
                <Field
                  label="Post end date"
                  type="date"
                  value={form.postEndDate}
                  onChange={(v) => update("postEndDate", v)}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                The post window drives the deadline alerts on the campaign board — anything past
                the end date without a post link is flagged in red.
              </p>
            </Section>
          ) : null}

          {tab === "targeting" ? (
            <Section title="Targeting">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Target KOL count"
                  type="number"
                  value={form.targetKolCount}
                  onChange={(v) => update("targetKolCount", v)}
                />
                <Field
                  label="Max applications"
                  type="number"
                  value={form.maxApplications}
                  onChange={(v) => update("maxApplications", v)}
                />
              </div>

              <div className="mt-4">
                <Label id={`${uid}-kol-tiers`}>KOL tiers</Label>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby={`${uid}-kol-tiers`}
                >
                  {tierOptions.map((t) => {
                    const active = form.kolTiers.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => update("kolTiers", toggle(form.kolTiers, t))}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                          active
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Audience age range"
                  value={form.ageRange}
                  onChange={(v) => update("ageRange", v)}
                  placeholder="18-34"
                />
                <Field
                  label="Gender split"
                  value={form.genderSplit}
                  onChange={(v) => update("genderSplit", v)}
                  placeholder="70% F / 30% M"
                />
                <Field
                  label="Audience region"
                  value={form.audienceRegion}
                  onChange={(v) => update("audienceRegion", v)}
                  placeholder="HK"
                />
                <div>
                  <Label hint="Comma separated">Interests</Label>
                  <input
                    id={`${uid}-interests`}
                    type="text"
                    value={form.interests}
                    onChange={(e) => update("interests", e.target.value)}
                    placeholder="Fashion, Travel, Lifestyle"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                  />
                </div>
              </div>
            </Section>
          ) : null}

          {tab === "requirements" ? (
            <Section title="Requirements">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Deliverables
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      update("deliverables", [
                        ...form.deliverables,
                        {
                          platform: form.platforms[0] ?? "Instagram",
                          type: "",
                          count: 1,
                          length: "",
                          notes: "",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    <Plus size={14} /> Add deliverable
                  </button>
                </div>
                {form.deliverables.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No deliverables yet — add the content the KOL has to produce.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.deliverables.map((deliverable, index) => (
                      <div
                        key={`${index}-${deliverable.platform}-${deliverable.type}`}
                        className="border border-slate-200 rounded-lg p-3"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <Label htmlFor={`${uid}-deliverable-${index}-platform`}>
                              Platform
                            </Label>
                            <select
                              id={`${uid}-deliverable-${index}-platform`}
                              value={deliverable.platform}
                              onChange={(e) =>
                                update(
                                  "deliverables",
                                  form.deliverables.map((d, i) =>
                                    i === index
                                      ? { ...d, platform: e.target.value as Platform }
                                      : d,
                                  ),
                                )
                              }
                              className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                            >
                              {platformOptions.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Field
                            label="Type"
                            value={deliverable.type}
                            onChange={(v) =>
                              update(
                                "deliverables",
                                form.deliverables.map((d, i) =>
                                  i === index ? { ...d, type: v } : d,
                                ),
                              )
                            }
                            placeholder="Reel"
                          />
                          <Field
                            label="Count"
                            type="number"
                            value={String(deliverable.count)}
                            onChange={(v) =>
                              update(
                                "deliverables",
                                form.deliverables.map((d, i) =>
                                  i === index ? { ...d, count: toNumber(v) } : d,
                                ),
                              )
                            }
                          />
                          <Field
                            label="Length"
                            value={deliverable.length ?? ""}
                            onChange={(v) =>
                              update(
                                "deliverables",
                                form.deliverables.map((d, i) =>
                                  i === index ? { ...d, length: v } : d,
                                ),
                              )
                            }
                            placeholder="60–90s"
                          />
                        </div>
                        <div className="mt-3 flex items-end gap-3">
                          <div className="flex-1">
                            <Field
                              label="Notes"
                              value={deliverable.notes ?? ""}
                              onChange={(v) =>
                                update(
                                  "deliverables",
                                  form.deliverables.map((d, i) =>
                                    i === index ? { ...d, notes: v } : d,
                                  ),
                                )
                              }
                              placeholder="Daylight preferred"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              update(
                                "deliverables",
                                form.deliverables.filter((_, i) => i !== index),
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 pb-2"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label hint="One per line">Requirements</Label>
                  <textarea
                    id={`${uid}-requirements`}
                    rows={4}
                    value={form.requirementsText}
                    onChange={(e) => update("requirementsText", e.target.value)}
                    placeholder={"Tag @fxcreations\nUse #AGSSummer\nMention suspension feature"}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label hint="Comma separated">Mandatory tags</Label>
                    <input
                      id={`${uid}-mandatory-tags`}
                      type="text"
                      value={form.mandatoryTags}
                      onChange={(e) => update("mandatoryTags", e.target.value)}
                      placeholder="#AGSSummer, #FXBackToSchool"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <Label hint="Comma separated">Mandatory mentions</Label>
                    <input
                      id={`${uid}-mandatory-mentions`}
                      type="text"
                      value={form.mandatoryMentions}
                      onChange={(e) => update("mandatoryMentions", e.target.value)}
                      placeholder="@fxcreations"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`${uid}-disclosure`}>Disclosure text</Label>
                  <input
                    id={`${uid}-disclosure`}
                    type="text"
                    value={form.disclosureText}
                    onChange={(e) => update("disclosureText", e.target.value)}
                    placeholder="#廣告 Advertisement"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                  />
                </div>
                <Field
                  label="Brief doc URL"
                  type="url"
                  value={form.briefDocUrl}
                  onChange={(v) => update("briefDocUrl", v)}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="mt-4">
                <Label id={`${uid}-pickup-stores`}>Pickup stores</Label>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby={`${uid}-pickup-stores`}
                >
                  {stores.map((store) => {
                    const active = form.storeIds.includes(store.id);
                    return (
                      <button
                        key={store.id}
                        type="button"
                        onClick={() => update("storeIds", toggle(form.storeIds, store.id))}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                          active
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {store.district}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  The public form only offers the stores selected here. Leave empty to offer all.
                </p>
              </div>
            </Section>
          ) : null}

          {tab === "money" ? (
            <Section title="Money">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required htmlFor={`${uid}-fee-model`}>
                    Fee model
                  </Label>
                  <select
                    id={`${uid}-fee-model`}
                    value={form.feeModel}
                    onChange={(e) =>
                      update("feeModel", e.target.value as CampaignFeeModel)
                    }
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                  >
                    {feeModelOptions.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Field
                  label="Fee per KOL (HK$)"
                  type="number"
                  value={form.feePerKol}
                  onChange={(v) => update("feePerKol", v)}
                />
                <Field
                  label="Commission %"
                  type="number"
                  value={form.commissionPct}
                  onChange={(v) => update("commissionPct", v)}
                />
                <Field
                  label="Total budget (HK$)"
                  type="number"
                  value={form.totalBudget}
                  onChange={(v) => update("totalBudget", v)}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Commission-based campaigns show the percentage to the KOL as their referral
                discount.
              </p>
            </Section>
          ) : null}

          {error ? (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={requestClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {isEdit ? <Save size={14} /> : <Plus size={14} />}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create campaign"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
      {title}
    </p>
    {children}
  </div>
);

const Label = ({
  children,
  required,
  hint,
  htmlFor,
  id,
}: {
  children: ReactNode;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  id?: string;
}) => {
  const className =
    "flex items-baseline justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5";
  const content = (
    <>
      <span>
        {children}
        {required ? <span className="text-rose-500 ml-0.5">*</span> : null}
      </span>
      {hint ? <span className="text-[10px] font-normal text-slate-400 normal-case">{hint}</span> : null}
    </>
  );
  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={className}>
        {content}
      </label>
    );
  }
  return (
    <span id={id} className={className}>
      {content}
    </span>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  hint,
}: FieldProps) => {
  const id = useId();
  return (
    <div>
      <Label required={required} hint={hint} htmlFor={id}>
        {label}
      </Label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
      />
    </div>
  );
};

export default NewCampaignDialog;
