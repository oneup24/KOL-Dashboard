import type {
  Application,
  ApplicationStatus,
  MessageScope,
  Platform,
} from "@/types";

/**
 * The canonical pipeline every application walks through.
 * "New" is displayed as "Applied" on the campaign board.
 */
export const PIPELINE_STAGES: ApplicationStatus[] = [
  "New",
  "Reviewing",
  "Approved",
  "Product Ready",
  "Picked Up",
  "Brief Sent",
  "Content Live",
  "Completed",
];

/** Display labels for every application status. */
export const STAGE_LABELS: Record<ApplicationStatus, string> = {
  New: "Applied",
  Reviewing: "Reviewing",
  Approved: "Approved",
  "Product Ready": "Product Ready",
  "Picked Up": "Picked Up",
  "Brief Sent": "Brief Sent",
  "Content Live": "Content Live",
  Completed: "Completed",
  Rejected: "Rejected",
};

/**
 * The next linear stage of the pipeline, or `null` once it is finished.
 * A rejected application goes back to "Reviewing" so it can be reopened.
 */
export const nextPipelineStage = (
  status: ApplicationStatus,
): ApplicationStatus | null => {
  const index = PIPELINE_STAGES.indexOf(status);
  if (index === -1) return "Reviewing";
  return PIPELINE_STAGES[index + 1] ?? null;
};

/**
 * The timestamp that marks the moment an application entered a stage.
 * Used for "days in stage" counters and deadline alerts.
 */
export const stageTimestamp = (
  application: Application,
  status: ApplicationStatus,
): string | undefined => {
  switch (status) {
    case "New":
      return application.appliedAt;
    case "Reviewing":
      return application.reviewedAt;
    case "Approved":
      return application.approvedAt;
    case "Product Ready":
      return application.productReadyAt;
    case "Picked Up":
      return application.pickedUpAt;
    case "Brief Sent":
      return application.briefSentAt;
    case "Content Live":
      return application.contentLiveAt;
    case "Completed":
      return application.completedAt;
    case "Rejected":
      return application.rejectedAt;
    default:
      return undefined;
  }
};

/**
 * True when a campaign's application deadline has passed.
 *
 * The deadline is an ISO date (`2026-10-20`) and stays open until the end of
 * that day, so a KOL can still apply on the deadline itself. Used by the
 * public page (to hide the form) and by `addApplication` (to enforce it).
 */
export const isPastDeadline = (
  deadline: string | undefined,
  now: Date = new Date(),
): boolean => {
  const trimmed = deadline?.trim();
  if (!trimmed) return false;
  const cutoff = new Date(`${trimmed}T23:59:59.999`);
  if (Number.isNaN(cutoff.getTime())) return false;
  return now.getTime() > cutoff.getTime();
};

/**
 * Which message scope the marketer should use for a given workflow stage.
 */
export const scopeForStatus = (status: ApplicationStatus): MessageScope => {
  switch (status) {
    case "Approved":
      return "kol_approved";
    case "Product Ready":
      return "kol_pickup";
    case "Picked Up":
    case "Brief Sent":
      return "kol_brief";
    case "Rejected":
      return "kol_denied";
    case "New":
      return "kol_approved";
    case "Reviewing":
      return "kol_reminder";
    default:
      return "kol_reminder";
  }
};

/** Short stage-specific line injected into the `{{stage_note}}` variable. */
export const stageNote = (status: ApplicationStatus): string => {
  switch (status) {
    case "New":
      return "We've just received your application and will review it shortly.";
    case "Reviewing":
      return "We're reviewing your application now — we'll come back to you shortly.";
    case "Approved":
      return "You're approved! We're preparing your product for collection now.";
    case "Product Ready":
      return "Your product is ready for collection at your chosen store.";
    case "Picked Up":
      return "Your product has been collected — the shooting brief is on its way.";
    case "Brief Sent":
      return "The shooting brief is with you — let us know if anything is unclear.";
    case "Content Live":
      return "Your content is live — thank you! Please share the post link so we can track it.";
    case "Completed":
      return "This collaboration is complete — thank you for partnering with FX Creations!";
    case "Rejected":
      return "We weren't able to move forward with this campaign, but we'd love to work together in the future.";
    default:
      return "";
  }
};

/** Whole days elapsed since an ISO timestamp (null when unknown). */
export const daysSince = (iso?: string): number | null => {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
};

/**
 * Best-effort platform detection from a post URL.
 */
export const platformFromUrl = (url: string): Platform | null => {
  const lower = url.trim().toLowerCase();
  if (!lower) return null;
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("tiktok.com")) return "TikTok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("xiaohongshu.com") || lower.includes("xhslink.com")) {
    return "Xiaohongshu";
  }
  return null;
};

/**
 * A `wa.me` deep link with the message pre-filled.
 */
export const whatsappLink = (number: string, text?: string): string => {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};
