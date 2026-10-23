import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Tag,
  X,
} from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import ApplicationMessagePanel from "@/components/applications/ApplicationMessagePanel";
import PostCaptureForm from "@/components/applications/PostCaptureForm";
import { useApplications } from "@/context/ApplicationsContext";
import { useCampaigns } from "@/context/CampaignsContext";
import { useKol } from "@/context/KolContext";
import { findStore } from "@/data/stores";
import { formatFollowers } from "@/data/seedKols";
import {
  PIPELINE_STAGES,
  STAGE_LABELS,
  daysSince,
  nextPipelineStage,
} from "@/components/shared/workflow";
import type { Application, ApplicationStatus, Campaign } from "@/types";
import PlatformBadge from "@/components/shared/PlatformBadge";

interface ApplicationDetailPanelProps {
  application: Application;
  onClose: () => void;
}

const nextStatusFlow: Record<ApplicationStatus, ApplicationStatus[]> = {
  New: ["Reviewing", "Approved", "Rejected"],
  Reviewing: ["Approved", "Rejected"],
  Approved: ["Product Ready", "Rejected"],
  "Product Ready": ["Picked Up", "Rejected"],
  "Picked Up": ["Brief Sent"],
  "Brief Sent": ["Content Live", "Completed"],
  "Content Live": ["Completed"],
  Completed: [],
  Rejected: ["Reviewing"],
};

type PanelTab = "details" | "message" | "post";

const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const { updateStatus, getById, approveApplication, rejectApplication, generatePromoCode } =
    useApplications();
  const { getById: getCampaignById } = useCampaigns();
  const { getById: getKolById } = useKol();

  // Always read latest from context (in case it was updated elsewhere)
  const live = getById(application.id) ?? application;
  const campaign: Campaign | undefined = getCampaignById(live.campaignId);
  const kol = getKolById(live.kolId);
  const store = findStore(live.pickupStoreId);
  const nextSteps = nextStatusFlow[live.status];

  const [tab, setTab] = useState<PanelTab>("details");
  const [copied, setCopied] = useState<string | null>(null);
  const [denyOpen, setDenyOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [generatedPromo, setGeneratedPromo] = useState<string | null>(null);

  // Belt and braces: the panel is keyed by application id in the list, but
  // this guarantees a stale promo code or reject reason can never survive a
  // switch to another application.
  useEffect(() => {
    setGeneratedPromo(null);
    setDenyOpen(false);
    setRejectReason("");
    setTab("details");
    setCopied(null);
  }, [application.id]);

  const handleClose = () => {
    setGeneratedPromo(null);
    setDenyOpen(false);
    setRejectReason("");
    onClose();
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const promoCode = generatedPromo ?? live.promoCode ?? null;

  /** Resolves a custom question id to the question text the KOL saw. */
  const questionText = (questionId: string): string =>
    campaign?.customQuestions.find((q) => q.id === questionId)?.question ?? questionId;

  const handleApprove = () => {
    const variantId = live.variantId ?? campaign?.variants[0]?.id;
    approveApplication(live.id, { variantId });
    const code = generatePromoCode(live.campaignId, live.kolId);
    if (code) setGeneratedPromo(code);
  };

  const handleDeny = () => {
    const reason = rejectReason.trim();
    if (!reason) return;
    rejectApplication(live.id, reason);
    setRejectReason("");
    setDenyOpen(false);
  };

  const advance = nextPipelineStage(live.status);
  const canApprove = live.status === "New" || live.status === "Reviewing" || live.status === "Rejected";
  const canDeny = live.status !== "Rejected" && live.status !== "Completed";
  const captureOpen = live.status === "Content Live" || live.status === "Completed";

  // "Approved" and "Rejected" have dedicated buttons below, and the linear
  // advance is rendered on its own — so they are filtered out of the list.
  const extraSteps = nextSteps.filter(
    (s) => s !== "Approved" && s !== "Rejected" && s !== advance,
  );
  const hasActions =
    canApprove || canDeny || advance !== null || extraSteps.length > 0;

  return (
    <aside className="bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Application
          </p>
          <h2 className="text-lg font-bold text-slate-800 truncate mt-0.5">
            {kol?.name ?? "Unknown KOL"}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{live.id}</p>
        </div>
        <button
          type="button"
          aria-label="Close application details"
          onClick={handleClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-5 sm:px-6 pt-4 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <ApplicationStatusBadge status={live.status} />
          {campaign ? (
            <span className="text-xs text-slate-500 truncate">{campaign.name}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 mt-3 -mb-px overflow-x-auto scrollbar-thin">
          {(
            [
              { id: "details", label: "Details" },
              { id: "message", label: "Message" },
              { id: "post", label: "Post data" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
        {tab === "details" ? (
          <>
            <Section title="Stage">
              <ol className="flex flex-wrap items-center gap-1.5">
                {PIPELINE_STAGES.map((stage) => {
                  const reached =
                    PIPELINE_STAGES.indexOf(live.status) >= PIPELINE_STAGES.indexOf(stage);
                  const current = live.status === stage;
                  return (
                    <li
                      key={stage}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                        current
                          ? "bg-slate-900 text-white border-slate-900"
                          : reached
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-white text-slate-300 border-slate-100"
                      }`}
                    >
                      {STAGE_LABELS[stage]}
                    </li>
                  );
                })}
              </ol>
              {live.status === "Rejected" && live.rejectReason ? (
                <p className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Reject reason
                  </span>
                  {live.rejectReason}
                </p>
              ) : null}
            </Section>

            <Section title="Campaign">
              {campaign ? (
                <div className="flex gap-3">
                  <img
                    src={campaign.productImage}
                    alt={campaign.productName}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-100"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{campaign.name}</p>
                    <p className="text-xs text-slate-500 truncate">{campaign.productName}</p>
                    <a
                      href={campaign.productUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Product page <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Unknown campaign.</p>
              )}
            </Section>

            {live.customAnswers && Object.keys(live.customAnswers).length > 0 ? (
              <Section title="Campaign questions">
                <ul className="space-y-2">
                  {Object.entries(live.customAnswers).map(([questionId, answer]) => (
                    <li
                      key={questionId}
                      className="bg-slate-50 border border-slate-100 rounded-lg p-3"
                    >
                      <p className="text-xs font-semibold text-slate-600">
                        {questionText(questionId)}
                      </p>
                      <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{answer}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <Section title="KOL contact">
              <div className="space-y-2 text-sm">
                <Row icon={MessageCircle} label="WhatsApp">
                  {kol?.whatsapp ? (
                    <>
                      <a
                        href={`https://wa.me/${kol.whatsapp.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-slate-700 hover:underline"
                      >
                        {kol.whatsapp}
                      </a>
                      <button
                        type="button"
                        onClick={() => copy(kol.whatsapp ?? "", "wa")}
                        className="ml-2 text-slate-400 hover:text-slate-700"
                        aria-label="Copy WhatsApp"
                      >
                        <Copy size={12} />
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400">Not on file</span>
                  )}
                </Row>
                <Row icon={Mail} label="Email">
                  {kol?.email ? (
                    <>
                      <a href={`mailto:${kol.email}`} className="text-slate-700 hover:underline">
                        {kol.email}
                      </a>
                      <button
                        type="button"
                        onClick={() => copy(kol.email ?? "", "email")}
                        className="ml-2 text-slate-400 hover:text-slate-700"
                        aria-label="Copy email"
                      >
                        <Copy size={12} />
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400">Not on file</span>
                  )}
                </Row>
                <Row icon={Tag} label="Social">
                  <span className="text-slate-700">
                    {kol ? `@${kol.handle}` : "—"}{" "}
                    <span className="text-slate-400 text-xs">
                      · {kol ? formatFollowers(kol.followers) : "—"}
                    </span>
                  </span>
                  {kol ? (
                    <span className="ml-2">
                      <PlatformBadge platform={kol.primaryPlatform} />
                    </span>
                  ) : null}
                </Row>
                <Row icon={Calendar} label="Applied">
                  <span className="text-slate-700">{formatDateTime(live.appliedAt)}</span>
                </Row>
              </div>
            </Section>

            <Section title="Pickup">
              {store ? (
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" /> {store.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{store.address}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hours: {store.hours} · Tel: {store.phone}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No store selected.</p>
              )}
              {live.notes ? (
                <p className="mt-3 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                    KOL notes
                  </span>
                  {live.notes}
                </p>
              ) : null}
              {live.internalNotes ? (
                <p className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Internal notes
                  </span>
                  <span className="whitespace-pre-wrap">{live.internalNotes}</span>
                </p>
              ) : null}
            </Section>

            {promoCode ? (
              <Section title="Promo code">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                  <span className="font-mono text-base font-bold text-emerald-800 tracking-wider">
                    {promoCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(promoCode, "promo")}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    <Copy size={12} /> {copied === "promo" ? "Copied" : "Copy"}
                  </button>
                </div>
                {live.discountValue ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Discount offered to the audience: {live.discountValue}
                  </p>
                ) : null}
              </Section>
            ) : null}

            <Section title="Workflow">
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-slate-300" /> Applied ·{" "}
                  {formatDateTime(live.appliedAt)}
                </li>
                {live.reviewedAt ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-500" /> Reviewed ·{" "}
                    {formatDateTime(live.reviewedAt)}
                  </li>
                ) : null}
                {live.approvedAt ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Approved ·{" "}
                    {formatDateTime(live.approvedAt)}
                    {daysSince(live.approvedAt) !== null ? (
                      <span className="text-xs text-slate-400">
                        ({daysSince(live.approvedAt)}d ago)
                      </span>
                    ) : null}
                  </li>
                ) : null}
                {live.productReadyAt ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-500" /> Product ready ·{" "}
                    {formatDateTime(live.productReadyAt)}
                  </li>
                ) : null}
                {live.pickedUpAt ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-violet-500" /> Product picked up ·{" "}
                    {formatDateTime(live.pickedUpAt)}
                  </li>
                ) : null}
                {live.briefSentAt ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-indigo-500" /> Brief sent ·{" "}
                    {formatDateTime(live.briefSentAt)}
                  </li>
                ) : null}
                {live.contentLiveAt ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-teal-500" /> Content live ·{" "}
                    {formatDateTime(live.contentLiveAt)}
                  </li>
                ) : null}
                {live.completedAt ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Completed ·{" "}
                    {formatDateTime(live.completedAt)}
                  </li>
                ) : null}
                {live.rejectedAt ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-slate-400" /> Rejected ·{" "}
                    {formatDateTime(live.rejectedAt)}
                  </li>
                ) : null}
              </ul>
            </Section>
          </>
        ) : null}

        {tab === "message" ? (
          <ApplicationMessagePanel application={live} kol={kol} campaign={campaign} />
        ) : null}

        {tab === "post" ? (
          captureOpen ? (
            <PostCaptureForm application={live} kol={kol} campaign={campaign} />
          ) : (
            <div className="text-center py-10">
              <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                <Tag size={22} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Post data capture unlocks at "Content Live"
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                Move the application to Content Live (or Completed) and the post link and
                metrics form will appear here.
              </p>
            </div>
          )
        ) : null}
      </div>

      {hasActions ? (
        <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/60 space-y-3">
          {denyOpen ? (
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
              <label
                htmlFor="reject-reason"
                className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold"
              >
                Reason for rejection (required)
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Audience profile doesn't match this campaign."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDeny}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 disabled:opacity-50"
                >
                  Confirm rejection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDenyOpen(false);
                    setRejectReason("");
                  }}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Next actions
          </p>

        <div className="space-y-2">
          {canApprove ? (
            <button
              type="button"
              onClick={handleApprove}
              className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Approve &amp; generate promo code
              <ChevronRight size={14} />
            </button>
          ) : null}

          {advance && advance !== "Approved" ? (
            <button
              type="button"
              onClick={() => updateStatus(live.id, advance)}
              className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              {advance === "Completed"
                ? "Mark completed"
                : advance === "Product Ready"
                  ? "Mark product ready (notify store)"
                  : advance === "Picked Up"
                    ? "Mark as picked up"
                    : advance === "Brief Sent"
                      ? "Mark brief sent"
                      : advance === "Content Live"
                        ? "Mark content live"
                        : `Move to ${advance}`}
              <ChevronRight size={14} />
            </button>
          ) : null}

          {extraSteps.map((next) => (
            <button
              key={next}
              type="button"
              onClick={() => updateStatus(live.id, next)}
              className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {next === "Completed"
                ? "Mark completed"
                : next === "Content Live"
                  ? "Mark content live"
                  : next === "Brief Sent"
                    ? "Mark brief sent"
                    : next === "Reviewing"
                      ? "Move to reviewing"
                      : `Move to ${next}`}
              <ChevronRight size={14} />
            </button>
          ))}

          {canDeny ? (
            <button
              type="button"
              onClick={() => setDenyOpen((v) => !v)}
              className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Deny application
              <ChevronRight size={14} />
            </button>
          ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
      {title}
    </p>
    {children}
  </div>
);

const Row = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2">
    <Icon size={14} className="text-slate-400 mt-1 flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  </div>
);

const formatDateTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default ApplicationDetailPanel;
