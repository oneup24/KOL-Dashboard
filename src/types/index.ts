import type { LucideIcon } from "lucide-react";

export type CampaignStatus = "Active" | "Planning" | "Completed" | "Draft";
export type Platform = "Instagram" | "TikTok" | "Xiaohongshu" | "YouTube";

export type KolTier = "Nano" | "Micro" | "Mid" | "Macro" | "Mega";
export type KolStatus = "active" | "prospect" | "blacklist";
export type KolSource = "fb_group" | "referral" | "inbound" | "event" | "other";

export interface KpiStat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface PerformancePoint {
  name: string;
  reach: number;
  engagement: number;
  conversions: number;
}

export interface PlatformShare {
  name: Platform;
  value: number;
}

// === KOL CRM ===

export interface KolPostMetrics {
  reach?: number;
  views?: number;
  likes?: number;
  comments?: number;
  saves?: number;
  er?: number;
}

export interface KolPostRecord {
  id: string;
  campaignId: number;
  postUrl: string;
  platform: Platform;
  postDate: string;
  postType?: string; // e.g. "Reel", "TikTok", "Long-form video", "RED post"
  variantId?: string; // product variant that was promoted
  metrics?: KolPostMetrics;
}

/**
 * CRM rollup for a single KOL — how many campaigns they have worked on,
 * how much content is live, and their average engagement rate.
 */
export interface KolStats {
  campaigns: number; // distinct campaigns across the KOL's posts
  postsLive: number; // total posts recorded for the KOL
  avgER: number; // mean post ER, rounded to 1 decimal (0 when unknown)
  lastPostDate?: string; // ISO date of the most recent post
}

/**
 * Master CRM record — one row per creator, reused across campaigns.
 * Campaign-specific data lives on `Application` (see below).
 */
export interface Kol {
  id: number;
  name: string;
  handle: string; // primary platform handle, WITHOUT @, lowercase, no spaces
  platforms: Platform[]; // all platforms they are on
  primaryPlatform: Platform;
  followers: number; // numeric, not a display string
  er: number; // engagement rate as a number, e.g. 5.2 (means 5.2%)
  whatsapp: string;
  email: string;
  igHandle?: string;
  niches: string[];
  region: string;
  tier: KolTier;
  rateCard: string; // display string e.g. "$1,200"
  source: KolSource;
  status: KolStatus;
  rating: number; // 0-100 internal score
  tags: string[];
  notes?: string;
  dateAdded: string; // ISO
  lastContactedAt?: string; // ISO
  posts: KolPostRecord[]; // history across campaigns
  avatar: string;
}

/**
 * Read-only display shape used by the legacy KOL directory list
 * (`topKols` in mockData). Kept so the overview / KOL database screens can
 * render formatted strings while the CRM moves to `Kol`.
 */
export interface KolSummary {
  id: number;
  name: string;
  handle: string;
  platform: Platform;
  followers: string;
  er: string;
  score: number;
  avatar: string;
  niche: string;
  region: string;
  averageFee: string;
}

// === Campaigns ===

export interface CampaignAudience {
  ageRange: string;
  genderSplit: string;
  interests: string[];
  region: string;
}

export interface CampaignVariant {
  id: string;
  label: string;
  sku?: string;
  stockByStore: Record<string, number>;
}

export interface CampaignDeliverable {
  platform: Platform;
  type: string;
  count: number;
  length?: string;
  notes?: string;
}

export interface CampaignQuestion {
  id: string;
  question: string;
  required: boolean;
}

export type CampaignFeeModel = "gift" | "flat" | "commission" | "flat_commission";

export interface Campaign {
  id: number;
  slug: string;
  name: string;
  status: CampaignStatus;
  progress: number;
  kols: number;
  budget: string;
  endDate: string;
  platform: Platform;
  manager: string;
  region: string;
  // Public-page fields
  productName: string;
  productUrl: string;
  productImage: string;
  productDescription: string;
  campaignBrief: string;
  requirements: string[];
  deliverables: CampaignDeliverable[];
  // Targeting
  targetKolCount: number; // target number of KOLs to recruit
  maxApplications: number; // cap on incoming applications (inbox flood control)
  platforms: Platform[]; // multi-select. `platform` stays the primary
  kolTiers: KolTier[];
  audience: CampaignAudience;
  // Schedule
  applicationDeadline: string; // ISO date — when KOLs can no longer apply
  postStartDate: string; // ISO date — earliest content may go live
  postEndDate: string; // ISO date — latest content may go live
  // Product
  variants: CampaignVariant[];
  // Content requirements (structured)
  mandatoryTags: string[]; // e.g. ["#AGSSummer"]
  mandatoryMentions: string[]; // e.g. ["@fxcreations"]
  disclosureText: string; // HK ad labelling, e.g. "#廣告 Advertisement"
  // Money
  feeModel: CampaignFeeModel;
  feePerKol: number;
  commissionPct: number;
  totalBudget: number;
  /**
   * Whether the fee details are shown to KOLs on the public campaign page.
   *
   * A campaign with no cash involved should leave this off: showing "Gift"
   * makes a KOL wonder whether they can ask for money. Turn it on when there
   * is a real fee to advertise — commission, a flat fee, or a special gift.
   */
  feeDisplayEnabled: boolean;
  /** The wording shown to KOLs. Only used when feeDisplayEnabled is true. */
  feeDisplayText: string;
  // Promo code — configured by the campaign owner
  /**
   * The promo code pattern for this campaign. The owner sets it.
   *   "FX-{campaign}-{kol}"  -> a unique code per KOL, e.g. FX-AGS-042
   *   "FXSUMMER20"           -> one shared code for every KOL in the campaign
   *   ""                     -> no promo code for this campaign
   */
  promoCodeTemplate: string;
  /** What the code is worth, e.g. "15% off" or "$50 off". Shown to approved KOLs. */
  promoCodeValue: string;
  // Ops
  briefDocUrl?: string;
  storeIds: string[];
  campaignCode: string; // 2-4 uppercase chars used in promo codes, e.g. "AGS"
  language: string; // e.g. "en-HK"
  customQuestions: CampaignQuestion[];
  updatedAt: string; // ISO — last write, used by the sheet sync
}

export interface ReportSummary {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export type TabId =
  | "overview"
  | "campaigns"
  | "kols"
  | "reports"
  | "applications"
  | "settings";

export interface NavItem {
  id: TabId;
  name: string;
  icon: LucideIcon;
  badge?: number;
}

// === Applications / KOL-facing form ===

export interface Store {
  id: string;
  name: string;
  district: string;
  address: string;
  hours: string;
  phone: string;
}

export type ApplicationStatus =
  | "New"
  | "Reviewing"
  | "Approved"
  | "Product Ready"
  | "Picked Up"
  | "Brief Sent"
  | "Content Live"
  | "Completed"
  | "Rejected";

/**
 * Campaign-specific junction between a campaign and a CRM `Kol`.
 * All contact details live on the `Kol` record (via `kolId`).
 */
export interface Application {
  id: string; // "APP-20261023-4F2A"
  campaignId: number;
  kolId: number; // FK -> Kol.id
  status: ApplicationStatus;
  appliedAt: string; // ISO
  updatedAt: string; // ISO
  pickupStoreId: string; // -> Store.id
  variantId?: string; // product variant the KOL receives
  notes?: string; // KOL's note from the public form
  internalNotes?: string; // marketer-only note
  /** Answers to `Campaign.customQuestions`, keyed by question id. */
  customAnswers?: Record<string, string>; // question id -> answer
  // Workflow timestamps
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
  productReadyAt?: string;
  pickedUpAt?: string;
  briefSentAt?: string;
  contentLiveAt?: string;
  completedAt?: string;
  // Promo
  promoCode?: string;
  discountValue?: string; // e.g. "15%" or "$50 off" — undefined if attribution-only
  // Deliverable tracking
  postUrl?: string;
  postPlatform?: Platform;
  postDate?: string;
  postType?: string; // e.g. "Reel", "TikTok", "YouTube Long-form", "RED Post"
  postMetrics?: KolPostMetrics;
  paid?: boolean; // fee paid (if campaign has a fee model)
}

// === Messaging ===

export type MessageChannel = "whatsapp" | "messenger" | "email" | "copy";
export type MessageScope =
  | "sales_prepare"
  | "kol_approved"
  | "kol_pickup"
  | "kol_brief"
  | "kol_denied"
  | "kol_reminder";

export interface MessageTemplate {
  id: string;
  name: string;
  scope: MessageScope;
  channel: MessageChannel;
  body: string; // uses {{variable}} placeholders
  isDefault: boolean;
}

export interface MessageLogEntry {
  id: string;
  templateId: string;
  applicationId: string;
  recipient: string; // whatsapp number or email
  channel: MessageChannel;
  renderedBody: string;
  sentAt: string; // ISO
  sentBy: string;
}
