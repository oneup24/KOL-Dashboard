import type { LucideIcon } from "lucide-react";

export type CampaignStatus = "Active" | "Planning" | "Completed" | "Draft";
export type Platform = "Instagram" | "TikTok" | "Xiaohongshu" | "YouTube";

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
  deliverables: string[];
  promoCode?: string;
}

export interface Kol {
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

export interface ReportSummary {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export type TabId = "overview" | "campaigns" | "kols" | "reports" | "applications";

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
  | "Product Ready"
  | "Picked Up"
  | "Brief Sent"
  | "Completed"
  | "Rejected";

export interface Application {
  id: string;
  campaignId: number;
  kolName: string;
  socialHandle: string;
  socialPlatform: Platform;
  followers: string;
  whatsapp: string;
  email: string;
  pickupStoreId: string;
  notes?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  // Workflow artifacts
  promoCode?: string;
  briefSentAt?: string;
  pickedUpAt?: string;
}
