import campaignSeedData from "../../campaign-seeds.json";
import type {
  Campaign,
  KolSummary,
  PerformancePoint,
  PlatformShare,
  ReportSummary,
} from "@/types";

export const CHART_COLORS = ["#8b5cf6", "#ec4899", "#ef4444", "#f59e0b"];

export const performanceData: PerformancePoint[] = [
  { name: "Jan", reach: 4000, engagement: 2400, conversions: 400 },
  { name: "Feb", reach: 3000, engagement: 1398, conversions: 350 },
  { name: "Mar", reach: 2000, engagement: 9800, conversions: 800 },
  { name: "Apr", reach: 2780, engagement: 3908, conversions: 500 },
  { name: "May", reach: 1890, engagement: 4800, conversions: 650 },
  { name: "Jun", reach: 2390, engagement: 3800, conversions: 450 },
  { name: "Jul", reach: 3490, engagement: 4300, conversions: 700 },
];

export const platformData: PlatformShare[] = [
  { name: "Instagram", value: 45 },
  { name: "TikTok", value: 35 },
  { name: "Xiaohongshu", value: 15 },
  { name: "YouTube", value: 5 },
];


/**
 * The campaign seed data lives in `campaign-seeds.json` at the repo root so
 * that both the app and the Vite config (which generates the static
 * link-preview pages) can read the same source without crossing a
 * TypeScript project boundary.
 */
export const seedCampaigns = campaignSeedData as Campaign[];

/**
 * Legacy alias — the campaigns list is now owned by `CampaignsContext`.
 * Kept so existing imports keep working.
 */
export const campaigns = seedCampaigns;

export const topKols: KolSummary[] = [
  {
    id: 1,
    name: "Elena H.",
    handle: "@elena_styles",
    platform: "Instagram",
    followers: "120K",
    er: "5.2%",
    score: 98,
    avatar: "https://i.pravatar.cc/150?img=1",
    niche: "Fashion",
    region: "HK",
    averageFee: "$1,200",
  },
  {
    id: 2,
    name: "Marcus T.",
    handle: "@marcus_travels",
    platform: "TikTok",
    followers: "450K",
    er: "8.1%",
    score: 95,
    avatar: "https://i.pravatar.cc/150?img=11",
    niche: "Travel",
    region: "TW",
    averageFee: "$2,400",
  },
  {
    id: 3,
    name: "Sophie L.",
    handle: "@sophie_lifestyle",
    platform: "Xiaohongshu",
    followers: "85K",
    er: "6.5%",
    score: 92,
    avatar: "https://i.pravatar.cc/150?img=5",
    niche: "Lifestyle",
    region: "CN",
    averageFee: "$900",
  },
  {
    id: 4,
    name: "Tech Rev",
    handle: "@techreviewers",
    platform: "YouTube",
    followers: "800K",
    er: "3.4%",
    score: 88,
    avatar: "https://i.pravatar.cc/150?img=12",
    niche: "Tech",
    region: "HK",
    averageFee: "$3,800",
  },
  {
    id: 5,
    name: "Ivy K.",
    handle: "@ivy_eats",
    platform: "Instagram",
    followers: "210K",
    er: "4.9%",
    score: 90,
    avatar: "https://i.pravatar.cc/150?img=9",
    niche: "Food",
    region: "HK",
    averageFee: "$1,600",
  },
  {
    id: 6,
    name: "Léa B.",
    handle: "@lea.beauty",
    platform: "Xiaohongshu",
    followers: "320K",
    er: "5.7%",
    score: 93,
    avatar: "https://i.pravatar.cc/150?img=20",
    niche: "Beauty",
    region: "CN",
    averageFee: "$2,100",
  },
  {
    id: 7,
    name: "Diego R.",
    handle: "@diego_fits",
    platform: "TikTok",
    followers: "540K",
    er: "7.2%",
    score: 91,
    avatar: "https://i.pravatar.cc/150?img=15",
    niche: "Fitness",
    region: "TW",
    averageFee: "$2,200",
  },
  {
    id: 8,
    name: "Nora A.",
    handle: "@nora.travels",
    platform: "YouTube",
    followers: "180K",
    er: "4.1%",
    score: 86,
    avatar: "https://i.pravatar.cc/150?img=32",
    niche: "Travel",
    region: "HK",
    averageFee: "$1,500",
  },
];

export const reportSummary: ReportSummary[] = [
  { label: "Total Impressions", value: "12.8M", change: "+18.2%", isPositive: true },
  { label: "Total Engagement", value: "612K", change: "+9.4%", isPositive: true },
  { label: "Avg. Engagement Rate", value: "4.78%", change: "+0.3%", isPositive: true },
  { label: "Conversions", value: "8,420", change: "-1.6%", isPositive: false },
  { label: "Cost per Conversion", value: "$5.37", change: "-4.1%", isPositive: true },
  { label: "Pipeline Revenue", value: "$284K", change: "+22.0%", isPositive: true },
];

export const reportChannelData = [
  { channel: "Instagram", spend: 18200, revenue: 72000 },
  { channel: "TikTok", spend: 14100, revenue: 96000 },
  { channel: "YouTube", spend: 7800, revenue: 34000 },
  { channel: "Xiaohongshu", spend: 5100, revenue: 82000 },
];

// Note: campaigns are now managed via CampaignsContext (see src/context/CampaignsContext.tsx)
