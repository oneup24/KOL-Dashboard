import {
  Activity,
  Calendar as CalendarIcon,
  DollarSign,
  Inbox,
  Settings2,
  TrendingUp,
  Users,
} from "lucide-react";
import type { KpiStat } from "@/types";

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

export const navItems = [
  { id: "overview" as const, name: "Overview", icon: Activity },
  { id: "campaigns" as const, name: "Campaigns", icon: CalendarIcon },
  { id: "applications" as const, name: "Applications", icon: Inbox },
  { id: "kols" as const, name: "KOL Database", icon: Users },
  { id: "reports" as const, name: "Reports", icon: TrendingUp },
  { id: "settings" as const, name: "Settings", icon: Settings2 },
];
