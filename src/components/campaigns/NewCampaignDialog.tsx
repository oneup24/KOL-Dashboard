import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { useCampaigns, type NewCampaignInput } from "@/context/CampaignsContext";
import type { Campaign, CampaignStatus, Platform } from "@/types";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; campaign: Campaign };

interface NewCampaignDialogProps {
  mode: Mode | null;
  onClose: () => void;
}

const statusOptions: CampaignStatus[] = ["Active", "Planning", "Completed", "Draft"];
const platformOptions: Platform[] = ["Instagram", "TikTok", "Xiaohongshu", "YouTube"];

interface FormState {
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
  requirementsText: string;
  deliverablesText: string;
  promoCode: string;
}

const blank: FormState = {
  name: "",
  status: "Draft",
  platform: "Instagram",
  region: "HK",
  manager: "",
  endDate: "",
  budget: "",
  productName: "",
  productUrl: "",
  productImage: "",
  productDescription: "",
  campaignBrief: "",
  requirementsText: "",
  deliverablesText: "",
  promoCode: "",
};

const toForm = (c: Campaign): FormState => ({
  name: c.name,
  status: c.status,
  platform: c.platform,
  region: c.region,
  manager: c.manager,
  endDate: c.endDate,
  budget: c.budget,
  productName: c.productName,
  productUrl: c.productUrl,
  productImage: c.productImage,
  productDescription: c.productDescription,
  campaignBrief: c.campaignBrief,
  requirementsText: c.requirements.join("\n"),
  deliverablesText: c.deliverables.join("\n"),
  promoCode: c.promoCode ?? "",
});

const NewCampaignDialog = ({ mode, onClose }: NewCampaignDialogProps) => {
  const { addCampaign, updateCampaign } = useCampaigns();
  const [form, setForm] = useState<FormState>(blank);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!mode) return;
    setError(null);
    setForm(mode.kind === "edit" ? toForm(mode.campaign) : blank);
  }, [mode]);

  if (!mode) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.endDate.trim() || !form.productName.trim()) {
      setError("Campaign name, end date, and product name are required.");
      return;
    }
    setSaving(true);
    const payload: NewCampaignInput = {
      name: form.name,
      status: form.status,
      platform: form.platform,
      region: form.region,
      manager: form.manager,
      endDate: form.endDate,
      budget: form.budget,
      productName: form.productName,
      productUrl: form.productUrl,
      productImage: form.productImage,
      productDescription: form.productDescription,
      campaignBrief: form.campaignBrief,
      requirements: form.requirementsText.split("\n"),
      deliverables: form.deliverablesText.split("\n"),
      promoCode: form.promoCode || undefined,
    };
    try {
      if (mode.kind === "create") {
        addCampaign(payload);
      } else {
        const listFromText = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
        updateCampaign(mode.campaign.id, {
          name: payload.name,
          status: payload.status,
          platform: payload.platform,
          region: payload.region,
          manager: payload.manager,
          endDate: payload.endDate,
          budget: payload.budget,
          productName: payload.productName,
          productUrl: payload.productUrl,
          productImage: payload.productImage,
          productDescription: payload.productDescription,
          campaignBrief: payload.campaignBrief,
          requirements: listFromText(form.requirementsText),
          deliverables: listFromText(form.deliverablesText),
          promoCode: payload.promoCode,
        });
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
    <div
      className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
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
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
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
                label="End date"
                required
                type="date"
                value={form.endDate}
                onChange={(v) => update("endDate", v)}
              />
              <div>
                <Label required>Status</Label>
                <select
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
                <Label>Platform</Label>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map((p) => {
                    const active = form.platform === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update("platform", p)}
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
              </div>
            </div>
          </Section>

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
                <Label>Product description</Label>
                <textarea
                  rows={3}
                  value={form.productDescription}
                  onChange={(e) => update("productDescription", e.target.value)}
                  placeholder="One-paragraph product pitch shown on the public page."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
                />
              </div>
            </div>
          </Section>

          <Section title="Campaign brief">
            <Label>Brief</Label>
            <textarea
              rows={3}
              value={form.campaignBrief}
              onChange={(e) => update("campaignBrief", e.target.value)}
              placeholder="What should the KOL actually do? Tone, scenes, audience."
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Label hint="One per line">Requirements</Label>
                <textarea
                  rows={3}
                  value={form.requirementsText}
                  onChange={(e) => update("requirementsText", e.target.value)}
                  placeholder="Tag @fxcreations&#10;Use #AGSSummer&#10;Mention suspension feature"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
                />
              </div>
              <div>
                <Label hint="One per line">Deliverables</Label>
                <textarea
                  rows={3}
                  value={form.deliverablesText}
                  onChange={(e) => update("deliverablesText", e.target.value)}
                  placeholder="1 Reel&#10;3 Stories&#10;1 set of stills"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
                />
              </div>
            </div>
            <div className="mt-4">
              <Field
                label="Promo code (optional)"
                value={form.promoCode}
                onChange={(v) => update("promoCode", v)}
                placeholder="FXSUMMER20"
              />
            </div>
          </Section>

          {error ? (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
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
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) => (
  <label className="flex items-baseline justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
    <span>
      {children}
      {required ? <span className="text-rose-500 ml-0.5">*</span> : null}
    </span>
    {hint ? <span className="text-[10px] font-normal text-slate-400 normal-case">{hint}</span> : null}
  </label>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

const Field = ({ label, value, onChange, placeholder, type = "text", required }: FieldProps) => (
  <div>
    <Label required={required}>{label}</Label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
    />
  </div>
);

// Suppress unused
void Trash2;

export default NewCampaignDialog;
