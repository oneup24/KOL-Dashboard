import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AtSign, ChevronRight, Mail, MapPin, MessageCircle, Store, User } from "lucide-react";
import {
  useApplications,
  type ApplicationRejectionReason,
} from "@/context/ApplicationsContext";
import { stores } from "@/data/stores";
import { parseFollowerCount } from "@/data/seedKols";
import type { Campaign, Platform } from "@/types";

interface ApplicationFormProps {
  campaign: Campaign;
  onSubmitted: (applicationId: string) => void;
}

const platformOptions: Platform[] = ["Instagram", "TikTok", "Xiaohongshu", "YouTube"];

/** What the applicant is told when the application is refused. */
const rejectionCopy: Record<ApplicationRejectionReason, string> = {
  "campaign-closed":
    "Applications for this campaign have closed. Please contact us directly if you would like to join a future campaign.",
  "limit-reached":
    "This campaign has reached its application limit. Please contact us directly.",
  blacklisted:
    "We are unable to process this application. Please contact us directly.",
};

const ApplicationForm = ({ campaign, onSubmitted }: ApplicationFormProps) => {
  const { addApplication } = useApplications();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const uid = useId();

  // Only the stores taking part in this campaign are offered; when the
  // campaign has no store list every store is available.
  const availableStores = useMemo(
    () =>
      campaign.storeIds.length > 0
        ? stores.filter((s) => campaign.storeIds.includes(s.id))
        : stores,
    [campaign.storeIds],
  );

  const [form, setForm] = useState({
    name: "",
    handle: "",
    platform: "Instagram" as Platform,
    followers: "",
    whatsapp: "",
    email: "",
    pickupStoreId: availableStores[0]?.id ?? "",
    notes: "",
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const selectedStore =
    availableStores.find((s) => s.id === form.pickupStoreId) ?? availableStores[0];

  // The answers to the campaign's custom questions, keyed by question id —
  // stored on the application itself, not flattened into the notes.
  const customAnswers = useMemo(() => {
    const record: Record<string, string> = {};
    for (const question of campaign.customQuestions) {
      const value = (answers[question.id] ?? "").trim();
      if (value) record[question.id] = value;
    }
    return record;
  }, [answers, campaign.customQuestions]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const missingRequired = campaign.customQuestions.find(
      (q) => q.required && !(answers[q.id] ?? "").trim(),
    );
    if (missingRequired) {
      setError(`Please answer: ${missingRequired.question}`);
      return;
    }

    if (
      !form.name.trim() ||
      !form.handle.trim() ||
      !form.whatsapp.trim() ||
      !form.email.trim() ||
      !selectedStore
    ) {
      setError("Please fill in your name, social handle, WhatsApp, email, and pickup store.");
      return;
    }

    setSubmitting(true);

    // Simulate a tiny async submit
    setTimeout(() => {
      const result = addApplication({
        campaignId: campaign.id,
        name: form.name.trim(),
        handle: form.handle.trim(),
        platform: form.platform,
        followers: parseFollowerCount(form.followers),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        pickupStoreId: selectedStore.id,
        notes: form.notes.trim() || undefined,
        customAnswers,
      });
      setSubmitting(false);
      if (!result.created) {
        // The campaign closed, hit its cap, or the handle is blacklisted.
        setError(rejectionCopy[result.reason]);
        return;
      }
      onSubmitted(result.application.id);
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
              value={form.name}
              onChange={(v) => update("name", v)}
              placeholder="Jane Wong"
            />
            <Field
              label="Social media handle"
              required
              icon={AtSign}
              value={form.handle}
              onChange={(v) => update("handle", v)}
              placeholder="@jane.shoots"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label id={`${uid}-platform-label`}>Platform</Label>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-labelledby={`${uid}-platform-label`}
              >
                {platformOptions.map((p) => {
                  const active = form.platform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={active}
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
            <Label required htmlFor={`${uid}-pickup-store`}>
              <Store size={14} className="inline mr-1 -mt-0.5 text-slate-400" /> Pickup store
            </Label>
            <select
              id={`${uid}-pickup-store`}
              required
              value={selectedStore?.id ?? ""}
              onChange={(e) => update("pickupStoreId", e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
            >
              {availableStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.district}
                </option>
              ))}
            </select>
            {selectedStore ? (
              <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-3">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" /> {selectedStore.name}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {selectedStore.address}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hours: {selectedStore.hours} · Tel: {selectedStore.phone}
                </p>
              </div>
            ) : null}
            <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
              <span>
                After we approve your application, we&apos;ll notify the store to prepare the
                product. You can collect it during opening hours ({selectedStore?.hours ?? "see store page"}).
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

          {campaign.customQuestions.length > 0 ? (
            <div className="space-y-4">
              <div className="border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Campaign questions
                </p>
              </div>
              {campaign.customQuestions.map((q) => (
                <div key={q.id}>
                  <Label required={q.required} htmlFor={`${uid}-q-${q.id}`}>
                    {q.question}
                  </Label>
                  <textarea
                    id={`${uid}-q-${q.id}`}
                    rows={2}
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div>
            <Label htmlFor={`${uid}-notes`}>Notes (optional)</Label>
            <textarea
              id={`${uid}-notes`}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              placeholder="Anything we should know — content ideas, availability, audience demographics…"
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
            >
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

const Field = ({ label, value, onChange, placeholder, type = "text", required, icon: Icon }: FieldProps) => {
  const id = useId();
  return (
    <div>
      <Label required={required} htmlFor={id}>
        {label}
      </Label>
      <div className="relative">
        {Icon ? (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        ) : null}
        <input
          id={id}
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
};

const Label = ({
  children,
  required,
  htmlFor,
  id,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
  id?: string;
}) => {
  const className = "block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5";
  const content = (
    <>
      {children}
      {required ? <span className="text-rose-500 ml-0.5">*</span> : null}
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

export default ApplicationForm;
