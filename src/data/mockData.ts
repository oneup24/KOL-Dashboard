import {
  Activity,
  Calendar as CalendarIcon,
  DollarSign,
  Inbox,
  TrendingUp,
  Users,
} from "lucide-react";
import type {
  Campaign,
  Kol,
  KpiStat,
  PerformancePoint,
  PlatformShare,
  ReportSummary,
} from "@/types";

export const CHART_COLORS = ["#8b5cf6", "#ec4899", "#ef4444", "#f59e0b"];

export const kpiData: KpiStat[] = [
  {
    title: "Total Reach",
    value: "2.4M",
    change: "+12.5%",
    isPositive: true,
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    title: "Engagement Rate",
    value: "4.8%",
    change: "+0.8%",
    isPositive: true,
    icon: Activity,
    color: "text-indigo-500",
    bg: "bg-indigo-100",
  },
  {
    title: "Campaign ROI",
    value: "320%",
    change: "-2.4%",
    isPositive: false,
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
  {
    title: "Total Spend",
    value: "$45,200",
    change: "+5.1%",
    isPositive: true,
    icon: DollarSign,
    color: "text-rose-500",
    bg: "bg-rose-100",
  },
];

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

const HERO_IMG_SUMMER =
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80";
const HERO_IMG_AGS =
  "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=1200&q=80";
const HERO_IMG_SCHOOL =
  "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80";
const HERO_IMG_HOLIDAY =
  "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80";
const HERO_IMG_BRAND =
  "https://images.unsplash.com/photo-1591561954555-607968c989ab?auto=format&fit=crop&w=1200&q=80";
const HERO_IMG_TRAVEL =
  "https://images.unsplash.com/photo-1501554728187-ce583db33af7?auto=format&fit=crop&w=1200&q=80";

export const seedCampaigns: Campaign[] = [
  {
    id: 1,
    slug: "summer-collection-2026",
    name: "Summer Collection Launch",
    status: "Active",
    progress: 75,
    kols: 12,
    budget: "$15,000",
    endDate: "2026-10-31",
    platform: "Instagram",
    manager: "Alice Wong",
    region: "HK",
    productName: "FX Creations AGS Pro Backpack — Sand",
    productUrl: "https://fxcreations.com/products/ags-pro-backpack-sand",
    productImage: HERO_IMG_SUMMER,
    productDescription:
      "Our new AGS Pro Backpack in sand colourway — anti-gravity suspension, 28L, lifetime warranty.",
    campaignBrief:
      "Show off how the AGS Pro fits into your everyday Hong Kong summer — cafe-hopping in Sheung Wan, weekend hikes, or a Stanley market run.",
    requirements: [
      "1 Reel (60–90s) + 3 Stories",
      "Tag @fxcreations + use #AGSSummer",
      "Mention AGS Pro suspension feature",
    ],
    deliverables: ["1 Reel", "3 Stories", "1 set of stills (min. 3 photos)"],
    promoCode: "FXSUMMER20",
  },
  {
    id: 2,
    slug: "ags-pro-backpack-review",
    name: "AGS Pro Backpack Review",
    status: "Planning",
    progress: 20,
    kols: 5,
    budget: "$8,000",
    endDate: "2026-11-15",
    platform: "YouTube",
    manager: "Jason Lee",
    region: "TW",
    productName: "FX Creations AGS Pro Backpack — Black",
    productUrl: "https://fxcreations.com/products/ags-pro-backpack-black",
    productImage: HERO_IMG_AGS,
    productDescription:
      "In-depth review of the AGS Pro Backpack — designed for daily commute and travel, with patented anti-gravity suspension.",
    campaignBrief:
      "Honest, in-depth review covering: build quality, comfort over a full work day, and how it handles a 3-day trip.",
    requirements: [
      "1 long-form video (8–12 min)",
      "Show real packing for a 3-day trip",
      "Compare against one other premium backpack",
    ],
    deliverables: ["1 long-form YouTube video", "2 short clips for IG/TikTok"],
  },
  {
    id: 3,
    slug: "back-to-school-2026",
    name: "Back to School Promo",
    status: "Completed",
    progress: 100,
    kols: 20,
    budget: "$25,000",
    endDate: "2026-09-01",
    platform: "TikTok",
    manager: "Mei Chan",
    region: "HK",
    productName: "FX Creations Campus Backpack",
    productUrl: "https://fxcreations.com/products/campus-backpack",
    productImage: HERO_IMG_SCHOOL,
    productDescription:
      "Lightweight campus backpack with laptop sleeve and organiser pockets.",
    campaignBrief: "Show your BTS morning routine — commute, library, lunch.",
    requirements: [
      "1 TikTok (15–30s)",
      "Use #FXBackToSchool",
      "Feature the laptop sleeve",
    ],
    deliverables: ["1 TikTok", "1 carousel post"],
  },
  {
    id: 4,
    slug: "holiday-gift-guide-2026",
    name: "Holiday Gift Guide",
    status: "Draft",
    progress: 0,
    kols: 0,
    budget: "$30,000",
    endDate: "2026-12-25",
    platform: "Xiaohongshu",
    manager: "Alice Wong",
    region: "CN",
    productName: "FX Creations Holiday Gift Edit",
    productUrl: "https://fxcreations.com/holiday-gifts",
    productImage: HERO_IMG_HOLIDAY,
    productDescription:
      "Curated holiday gift set — limited edition colourways and gift packaging.",
    campaignBrief: "Unbox the holiday set and share your top 3 picks under $100.",
    requirements: [
      "1 Xiaohongshu post (image + text)",
      "Mention the gift packaging",
      "Use #FXHolidayGifts",
    ],
    deliverables: ["1 RED post", "1 short video"],
  },
  {
    id: 5,
    slug: "q4-brand-awareness",
    name: "Q4 Brand Awareness",
    status: "Active",
    progress: 42,
    kols: 8,
    budget: "$18,500",
    endDate: "2026-12-10",
    platform: "Instagram",
    manager: "Jason Lee",
    region: "HK",
    productName: "FX Creations AGS Series",
    productUrl: "https://fxcreations.com/collections/ags",
    productImage: HERO_IMG_BRAND,
    productDescription: "Hero the AGS series across your week — work, weekend, travel.",
    campaignBrief: "Show the AGS series in 3 different real-life scenarios.",
    requirements: [
      "3 Reels across 2 weeks",
      "Tag @fxcreations",
      "Use #AGSLife",
    ],
    deliverables: ["3 Reels", "6 Stories"],
  },
  {
    id: 6,
    slug: "travel-essentials",
    name: "Travel Essentials Series",
    status: "Planning",
    progress: 10,
    kols: 3,
    budget: "$6,000",
    endDate: "2026-11-30",
    platform: "TikTok",
    manager: "Mei Chan",
    region: "TW",
    productName: "FX Creations Travel Pack",
    productUrl: "https://fxcreations.com/collections/travel",
    productImage: HERO_IMG_TRAVEL,
    productDescription: "Compact travel essentials — packing cubes, sling, passport holder.",
    campaignBrief: "Pack a carry-on in 60 seconds using the FX Travel Pack.",
    requirements: [
      "1 TikTok (45–60s)",
      "Show full pack for a 4-day trip",
      "Use #FXTravelPack",
    ],
    deliverables: ["1 TikTok", "1 carousel"],
  },
];

export const topKols: Kol[] = [
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

export const navItems = [
  { id: "overview" as const, name: "Overview", icon: Activity },
  { id: "campaigns" as const, name: "Campaigns", icon: CalendarIcon },
  { id: "applications" as const, name: "Applications", icon: Inbox },
  { id: "kols" as const, name: "KOL Database", icon: Users },
  { id: "reports" as const, name: "Reports", icon: TrendingUp },
];
