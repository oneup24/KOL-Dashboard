import { useState, type FormEvent } from "react";
import { AtSign, ChevronRight, Mail, MapPin, MessageCircle, Store, User } from "lucide-react";
import { useApplications } from "@/context/ApplicationsContext";
import { stores } from "@/data/stores";
import type { Campaign, Platform } from "@/types";

interface ApplicationFormProps {
  campaign: Campaign;
  onSubmitted: (applicationId: string) => void;
}

const platformOptions: Platform[] = ["Instagram", "TikTok", "Xiaohongshu", "YouTube"];

const ApplicationForm = ({ campaign, onSubmitted }: ApplicationFormProps) => {
  const { addApplication } = useApplications();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    kolName: "",
    socialHandle: "",
    socialPlatform: "Instagram" as Platform,
    followers: "",
    whatsapp: "",
    email: "",
    pickupStoreId: stores[0]?.id ?? "",
    notes: "",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!form.kolName.trim() || !form.socialHandle.trim() || !form.whatsapp.trim() || !form.email.trim() || !form.pickupStoreId) {
      setError("Please fill in your name, social handle, WhatsApp, email, and pickup store.");
      return;
    }
    setSubmitting(true);
    // Simulate a tiny async submit
    setTimeout(() => {
      const created = addApplication({
        campaignId: campaign.id,
        kolName: form.kolName.trim(),
        socialHandle: form.socialHandle.trim(),
        socialPlatform: form.socialPlatform,
        followers: form.followers.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        pickupStoreId: form.pickupStoreId,
        notes: form.notes.trim() || undefined,
      });
      setSubmitting(false);
      onSubmitted(created.id);
    }, 400);
  };

  return (
    <section id="apply" className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Apply to this campaign</h2>
        <p className="mt-2 text-slate-600">
          Submit the form and our marketing team will reach out on WhatsApp within 24–48 hours.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Your name"
              required
              icon={User}
              value={form.kolName}
              onChange={(v) => update("kolName", v)}
              placeholder="Jane Wong"
            />
            <Field
              label="Social media handle"
              required
              icon={AtSign}
              value={form.socialHandle}
              onChange={(v) => update("socialHandle", v)}
              placeholder="@jane.shoots"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Platform</Label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((p) => {
                  const active = form.socialPlatform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => update("socialPlatform", p)}
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
            <Field
              label="Followers (approx.)"
              icon={User}
              value={form.followers}
              onChange={(v) => update("followers", v)}
              placeholder="e.g. 25K"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="WhatsApp number"
              required
              icon={MessageCircle}
              value={form.whatsapp}
              onChange={(v) => update("whatsapp", v)}
              placeholder="+852 9123 4567"
            />
            <Field
              label="Email"
              required
              type="email"
              icon={Mail}
              value={form.email}
              onChange={(v) => update("email", v)}
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <Label required>
              <Store size={14} className="inline mr-1 -mt-0.5 text-slate-400" /> Pickup store
            </Label>
            <select
              required
              value={form.pickupStoreId}
              onChange={(e) => update("pickupStoreId", e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.district}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
              <span>
                After we approve your application, we'll notify the store to prepare the product.
                You can collect it during opening hours (
                {stores.find((s) => s.id === form.pickupStoreId)?.hours ?? "see store page"}).
              </span>
            </p>
            <a
              href="https://fxcreations.com/pages/store-location"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1 inline-block text-xs text-slate-500 underline"
            >
              View all store locations ↗
            </a>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              placeholder="Anything we should know — content ideas, availability, audience demographics…"
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
            />
          </div>

          {error ? (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit application"}
            <ChevronRight size={16} />
          </button>

          <p className="text-xs text-slate-400">
            By submitting, you agree to be contacted by the FX Creations marketing team about this
            campaign.
          </p>
        </form>
      </div>
    </section>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: typeof User;
}

const Field = ({ label, value, onChange, placeholder, type = "text", required, icon: Icon }: FieldProps) => (
  <div>
    <Label required={required}>{label}</Label>
    <div className="relative">
      {Icon ? (
        <Icon
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      ) : null}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none`}
      />
    </div>
  </div>
);

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
    {children}
    {required ? <span className="text-rose-500 ml-0.5">*</span> : null}
  </label>
);

export default ApplicationForm;
