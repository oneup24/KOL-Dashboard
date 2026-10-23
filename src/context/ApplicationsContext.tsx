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
import { useCampaigns } from "@/context/CampaignsContext";
import { useKol } from "@/context/KolContext";
import { useSheets } from "@/context/SheetsContext";
import { isPastDeadline } from "@/components/shared/workflow";
import {
  buildPromoCode,
  isPerKolTemplate,
  promoValueForCampaign,
  randomPromoSuffix,
} from "@/data/promoCode";
import { seedApplications } from "@/data/seedApplications";
import { normaliseHandle } from "@/data/seedKols";
import type {
  Application,
  ApplicationStatus,
  Kol,
  MessageLogEntry,
  Platform,
} from "@/types";

export interface NewApplicationInput {
  campaignId: number;
  name: string;
  handle: string;
  platform: Platform;
  followers: number;
  whatsapp: string;
  email: string;
  pickupStoreId: string;
  variantId?: string;
  notes?: string;
  /** Answers to the campaign's `customQuestions`, keyed by question id. */
  customAnswers?: Record<string, string>;
}

export type ApproveApplicationOptions = Partial<
  Pick<Application, "variantId" | "internalNotes" | "promoCode" | "discountValue" | "notes">
>;

/** Why an application was refused. */
export type ApplicationRejectionReason =
  /** The campaign is closed (not open to applications, or the deadline passed). */
  | "campaign-closed"
  /** The campaign already received its maximum number of applications. */
  | "limit-reached"
  /** The KOL is on the blacklist — no CRM record is created for them. */
  | "blacklisted";

/**
 * The outcome of `addApplication`. A refused application never creates an
 * application record (and never creates a CRM record for a brand-new handle).
 */
export type AddApplicationResult =
  | { created: true; application: Application }
  | { created: false; reason: ApplicationRejectionReason };

interface ApplicationsContextValue {
  applications: Application[];
  newCount: number;
  messageLog: MessageLogEntry[];
  addApplication: (input: NewApplicationInput) => AddApplicationResult;
  updateStatus: (
    id: string,
    status: ApplicationStatus,
    extras?: Partial<Application>,
  ) => void;
  approveApplication: (id: string, opts?: ApproveApplicationOptions) => void;
  rejectApplication: (id: string, reason: string) => void;
  generatePromoCode: (campaignId: number, kolId: number) => string;
  logMessage: (entry: Omit<MessageLogEntry, "id" | "sentAt">) => MessageLogEntry;
  messagesFor: (applicationId: string) => MessageLogEntry[];
  getByCampaign: (campaignId: number) => Application[];
  getById: (id: string) => Application | undefined;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

const generateId = (): string => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `APP-${stamp}-${rand}`;
};

const generateLogId = (): string => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MSG-${stamp}-${rand}`;
};

/**
 * Workflow timestamp for a status. An existing timestamp is never
 * overwritten — the status transition only fills the gap.
 */
const statusTimestamp = (
  application: Application,
  status: ApplicationStatus,
  now: string,
): Partial<Application> => {
  switch (status) {
    case "Reviewing":
      return application.reviewedAt ? {} : { reviewedAt: now };
    case "Approved":
      return application.approvedAt ? {} : { approvedAt: now };
    case "Product Ready":
      return application.productReadyAt ? {} : { productReadyAt: now };
    case "Picked Up":
      return application.pickedUpAt ? {} : { pickedUpAt: now };
    case "Brief Sent":
      return application.briefSentAt ? {} : { briefSentAt: now };
    case "Content Live":
      return application.contentLiveAt ? {} : { contentLiveAt: now };
    case "Completed":
      return application.completedAt ? {} : { completedAt: now };
    case "Rejected":
      return application.rejectedAt ? {} : { rejectedAt: now };
    default:
      return {};
  }
};

export const ApplicationsProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<Application[]>(seedApplications);
  const [messageLog, setMessageLog] = useState<MessageLogEntry[]>([]);
  const { addKol, updateKol, findByHandle, getById: getKolById, touchLastContacted } =
    useKol();
  const { getById: getCampaignById } = useCampaigns();
  const { snapshot, push } = useSheets();
  const hydrated = useRef(false);

  // Seed from the sheet once, the first time a snapshot arrives. Later
  // refreshes do not clobber local edits — the sheet is the write target,
  // not a live read loop.
  useEffect(() => {
    if (hydrated.current || !snapshot) return;
    if (snapshot.applications.length > 0) setApplications(snapshot.applications);
    if (snapshot.messageLog.length > 0) setMessageLog(snapshot.messageLog);
    hydrated.current = true;
  }, [snapshot]);

  const addApplication = useCallback(
    (input: NewApplicationInput): AddApplicationResult => {
      const now = new Date().toISOString();
      const campaign = getCampaignById(input.campaignId);
      if (!campaign) return { created: false, reason: "campaign-closed" };

      // The deadline is enforced here as well as in the UI so a stale public
      // page (or a direct call) cannot slip an application in after the cut-off.
      const deadline = campaign.applicationDeadline || campaign.endDate;
      if (isPastDeadline(deadline)) {
        return { created: false, reason: "campaign-closed" };
      }

      // Cap on incoming applications — inbox flood control. A campaign with a
      // cap of 0 accepts nobody.
      const received = applications.filter((a) => a.campaignId === campaign.id).length;
      if (received >= campaign.maxApplications) {
        return { created: false, reason: "limit-reached" };
      }

      const handle = normaliseHandle(input.handle);
      const existing = findByHandle(handle);

      // Blacklisted KOLs are refused before any record is written, so a fresh
      // application never lands in the marketer's inbox.
      if (existing && existing.status === "blacklist") {
        return { created: false, reason: "blacklisted" };
      }

      let kolId: number;
      if (existing) {
        // Known KOL — reuse the CRM record and refresh what changed.
        kolId = existing.id;
        touchLastContacted(kolId);

        const patch: Partial<Kol> = {};
        if (input.followers > 0) patch.followers = input.followers;
        if (!existing.whatsapp && input.whatsapp.trim()) {
          patch.whatsapp = input.whatsapp.trim();
        }
        if (!existing.email && input.email.trim()) {
          patch.email = input.email.trim();
        }
        if (!existing.platforms.includes(input.platform)) {
          patch.platforms = [...existing.platforms, input.platform];
        }
        if (Object.keys(patch).length > 0) updateKol(kolId, patch);
      } else {
        // New face — create the CRM record on the fly.
        const created = addKol({
          name: input.name,
          handle,
          platform: input.platform,
          platforms: [input.platform],
          primaryPlatform: input.platform,
          followers: input.followers,
          whatsapp: input.whatsapp,
          email: input.email,
          source: "inbound",
          status: "active",
        });
        kolId = created.id;
      }

      const next: Application = {
        id: generateId(),
        campaignId: input.campaignId,
        kolId,
        status: "New",
        appliedAt: now,
        updatedAt: now,
        pickupStoreId: input.pickupStoreId,
        variantId: input.variantId,
        notes: input.notes,
        customAnswers: input.customAnswers,
      };
      setApplications((prev) => [next, ...prev]);
      push("applications", next);
      return { created: true, application: next };
    },
    [addKol, applications, findByHandle, getCampaignById, push, touchLastContacted, updateKol],
  );

  const updateStatus = useCallback(
    (id: string, status: ApplicationStatus, extras?: Partial<Application>) => {
      const now = new Date().toISOString();
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const merged: Application = { ...a, ...extras, status, updatedAt: now };
          return { ...merged, ...statusTimestamp(merged, status, now) };
        }),
      );
      const current = applications.find((a) => a.id === id);
      if (current) {
        const merged: Application = { ...current, ...extras, status, updatedAt: now };
        push("applications", { ...merged, ...statusTimestamp(merged, status, now) });
      }
    },
    [applications, push],
  );

  const approveApplication = useCallback(
    (id: string, opts?: ApproveApplicationOptions) => {
      const now = new Date().toISOString();
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          return {
            ...a,
            ...opts,
            status: "Approved",
            approvedAt: a.approvedAt ?? now,
            updatedAt: now,
          };
        }),
      );
      const current = applications.find((a) => a.id === id);
      if (current) {
        push("applications", {
          ...current,
          ...opts,
          status: "Approved",
          approvedAt: current.approvedAt ?? now,
          updatedAt: now,
        });
      }
    },
    [applications, push],
  );

  const rejectApplication = useCallback(
    (id: string, reason: string) => {
      const now = new Date().toISOString();
      setApplications((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "Rejected",
                rejectReason: reason,
                rejectedAt: a.rejectedAt ?? now,
                updatedAt: now,
              }
            : a,
        ),
      );
      const current = applications.find((a) => a.id === id);
      if (current) {
        push("applications", {
          ...current,
          status: "Rejected",
          rejectReason: reason,
          rejectedAt: current.rejectedAt ?? now,
          updatedAt: now,
        });
      }
    },
    [applications, push],
  );

  /**
   * Builds a unique promo code for a campaign + KOL pair and stores it (plus
   * the campaign-derived discount) on the matching application.
   * Collisions get a 2-char suffix: FX-AGS-042-X7
   */
  const generatePromoCode = useCallback(
    (campaignId: number, kolId: number): string => {
      const campaign = getCampaignById(campaignId);
      const kol = getKolById(kolId);
      if (!campaign || !kol) return "";

      const target = applications.find(
        (a) => a.campaignId === campaignId && a.kolId === kolId,
      );
      const used = new Set(
        applications
          .filter((a) => a.id !== target?.id)
          .map((a) => a.promoCode)
          .filter((code): code is string => Boolean(code)),
      );

      const base = buildPromoCode(campaign, kol);
      // A template with {kol} is meant to be unique per KOL, so a clash gets
      // a suffix. A shared template (no {kol}) is the same code for every KOL
      // in the campaign by design — suffixing it would break that.
      const perKol = isPerKolTemplate(campaign.promoCodeTemplate ?? "");
      let code = base;
      if (perKol && used.has(code)) {
        do {
          code = `${base}-${randomPromoSuffix()}`;
        } while (used.has(code));
      }

      if (target) {
        const discount = promoValueForCampaign(campaign);
        const updatedAt = new Date().toISOString();
        setApplications((prev) =>
          prev.map((a) =>
            a.id === target.id
              ? {
                  ...a,
                  promoCode: code,
                  discountValue: discount,
                  updatedAt,
                }
              : a,
          ),
        );
        push("applications", {
          ...target,
          promoCode: code,
          discountValue: discount,
          updatedAt,
        });
      }

      return code;
    },
    [applications, getCampaignById, getKolById, push],
  );

  const logMessage = useCallback(
    (entry: Omit<MessageLogEntry, "id" | "sentAt">): MessageLogEntry => {
      const full: MessageLogEntry = {
        ...entry,
        id: generateLogId(),
        sentAt: new Date().toISOString(),
      };
      setMessageLog((prev) => [full, ...prev]);
      push("messageLog", full);
      return full;
    },
    [push],
  );

  const messagesFor = useCallback(
    (applicationId: string): MessageLogEntry[] =>
      messageLog.filter((m) => m.applicationId === applicationId),
    [messageLog],
  );

  const getByCampaign = useCallback(
    (campaignId: number) => applications.filter((a) => a.campaignId === campaignId),
    [applications],
  );

  const getById = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications],
  );

  const newCount = useMemo(
    () => applications.filter((a) => a.status === "New").length,
    [applications],
  );

  const value = useMemo(
    () => ({
      applications,
      newCount,
      messageLog,
      addApplication,
      updateStatus,
      approveApplication,
      rejectApplication,
      generatePromoCode,
      logMessage,
      messagesFor,
      getByCampaign,
      getById,
    }),
    [
      applications,
      newCount,
      messageLog,
      addApplication,
      updateStatus,
      approveApplication,
      rejectApplication,
      generatePromoCode,
      logMessage,
      messagesFor,
      getByCampaign,
      getById,
    ],
  );

  return (
    <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
  );
};

export const useApplications = (): ApplicationsContextValue => {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) {
    throw new Error("useApplications must be used within an ApplicationsProvider");
  }
  return ctx;
};
