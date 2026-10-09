import type { Platform } from "@/types";

const platformStyles: Record<Platform, string> = {
  Instagram: "bg-pink-50 text-pink-700 border-pink-200",
  TikTok: "bg-slate-900 text-white border-slate-900",
  Xiaohongshu: "bg-rose-50 text-rose-700 border-rose-200",
  YouTube: "bg-red-50 text-red-700 border-red-200",
};

interface PlatformBadgeProps {
  platform: Platform;
}

const PlatformBadge = ({ platform }: PlatformBadgeProps) => (
  <span
    className={`px-2 py-0.5 text-xs font-medium rounded border ${platformStyles[platform]}`}
  >
    {platform}
  </span>
);

export default PlatformBadge;
