import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

interface ApplicationSuccessProps {
  applicationId: string;
  campaignName: string;
  onReset: () => void;
}

const ApplicationSuccess = ({ applicationId, campaignName, onReset }: ApplicationSuccessProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <section id="apply" className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900">
          Application received
        </h2>
        <p className="mt-3 text-slate-600">
          Thanks for applying to <span className="font-semibold">{campaignName}</span>.
          We'll be in touch on WhatsApp within 24–48 hours to confirm.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-4 pr-1.5 py-1.5 shadow-sm">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Ref</span>
          <span className="font-mono text-sm text-slate-800">{applicationId}</span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700"
          >
            <Copy size={12} /> {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              What happens next
            </p>
            <ol className="mt-2 text-sm text-slate-700 space-y-1.5 list-decimal list-inside">
              <li>We confirm your application.</li>
              <li>We notify the store to prepare your product.</li>
              <li>You pick up the product at the chosen store.</li>
              <li>We share the shooting brief + your promo code.</li>
            </ol>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Need to reach us?
            </p>
            <p className="mt-2 text-sm text-slate-700">
              DM us on Messenger or WhatsApp — quote your reference number:
            </p>
            <a
              href="https://wa.me/85228820000"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
            >
              <MessageCircle size={14} /> Chat on WhatsApp
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-10 text-sm text-slate-500 underline hover:text-slate-700"
        >
          Submit another application
        </button>
      </div>
    </section>
  );
};

export default ApplicationSuccess;
