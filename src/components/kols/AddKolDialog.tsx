import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { UserPlus, X } from "lucide-react";
import { useKol } from "@/context/KolContext";
import { parseFollowerCount } from "@/data/seedKols";
import type { KolSource, KolTier, Platform } from "@/types";

interface AddKolDialogProps {
  onClose: () => void;
}

const platformOptions: Platform[] = ["Instagram", "TikTok", "Xiaohongshu", "YouTube"];
const tierOptions: KolTier[] = ["Nano", "Micro", "Mid", "Macro", "Mega"];
const sourceOptions: { value: KolSource; label: string }[] = [
  { value: "inbound", label: "Inbound" },
  { value: "referral", label: "Referral" },
  { value: "fb_group", label: "FB group" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

/**
 * Compact "Add KOL" modal — creates a CRM record from the fields
 * `NewKolInput` needs. The new KOL shows up in the grid straight away.
 */
const AddKolDialog = ({ onClose }: AddKolDialogProps) => {
  const { addKol } = useKol();
  const uid = useId();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    handle: "",
    platform: "Instagram" as Platform,
    followers: "",
    whatsapp: "",
    email: "",
    niches: "",
    region: "HK",
    tier: "Micro" as KolTier,
    rateCard: "$0",
    source: "inbound" as KolSource,
    notes: "",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Escape closes the dialog.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.handle.trim()) {
      setError("Name and social handle are required.");
      return;
    }
    addKol({
      name: form.name.trim(),
      handle: form.handle.trim(),
      platform: form.platform,
      platforms: [form.platform],
      primaryPlatform: form.platform,
      followers: parseFollowerCount(form.followers),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim(),
      niches: form.niches
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      region: form.region.trim(),
      tier: form.tier,
      rateCard: form.rateCard.trim() || "$0",
      source: form.source,
      status: "active",
      notes: form.notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 id={`${uid}-title`} className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={18} /> Add KOL
          </h3>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 flex flex-col"
        >
          <div className="flex-1 overflow-auto scrollbar-thin p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              id={`${uid}-name`}
              label="Name"
              required
              value={form.name}
              onChange={(v) => update("name", v)}
              placeholder="Jane Wong"
            />
            <Field
              id={`${uid}-handle`}
              label="Handle"
              required
              value={form.handle}
              onChange={(v) => update("handle", v)}
              placeholder="jane.shoots"
            />
            <div>
              <Label htmlFor={`${uid}-platform`}>Platform</Label>
              <select
                id={`${uid}-platform`}
                value={form.platform}
                onChange={(e) => update("platform", e.target.value as Platform)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
              >
                {platformOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <Field
              id={`${uid}-followers`}
              label="Followers"
              value={form.followers}
              onChange={(v) => update("followers", v)}
              placeholder="25K"
            />
            <Field
              id={`${uid}-whatsapp`}
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(v) => update("whatsapp", v)}
              placeholder="+852 9123 4567"
            />
            <Field
              id={`${uid}-email`}
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => update("email", v)}
              placeholder="jane@example.com"
            />
            <Field
              id={`${uid}-niches`}
              label="Niches"
              hint="Comma separated"
              value={form.niches}
              onChange={(v) => update("niches", v)}
              placeholder="Fashion, Lifestyle"
            />
            <Field
              id={`${uid}-region`}
              label="Region"
              value={form.region}
              onChange={(v) => update("region", v)}
              placeholder="HK"
            />
            <div>
              <Label htmlFor={`${uid}-tier`}>Tier</Label>
              <select
                id={`${uid}-tier`}
                value={form.tier}
                onChange={(e) => update("tier", e.target.value as KolTier)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
              >
                {tierOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Field
              id={`${uid}-rate`}
              label="Rate card"
              value={form.rateCard}
              onChange={(v) => update("rateCard", v)}
              placeholder="$1,200"
            />
            <div>
              <Label htmlFor={`${uid}-source`}>Source</Label>
              <select
                id={`${uid}-source`}
                value={form.source}
                onChange={(e) => update("source", e.target.value as KolSource)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
              >
                {sourceOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor={`${uid}-notes`}>Notes</Label>
              <textarea
                id={`${uid}-notes`}
                rows={3}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Availability, locations, rates, anything worth remembering."
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
              />
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mx-6 mb-6 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
            >
              {error}
            </p>
          ) : null}

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
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
            >
              <UserPlus size={14} /> Add KOL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Label = ({
  children,
  htmlFor,
  required,
  hint,
}: {
  children: ReactNode;
  htmlFor: string;
  required?: boolean;
  hint?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className="flex items-baseline justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5"
  >
    <span>
      {children}
      {required ? <span className="text-rose-500 ml-0.5">*</span> : null}
    </span>
    {hint ? <span className="text-[10px] font-normal text-slate-400 normal-case">{hint}</span> : null}
  </label>
);

const Field = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) => (
  <div>
    <Label htmlFor={id} required={required} hint={hint}>
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

export default AddKolDialog;
