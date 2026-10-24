import {
  Bell,
  CheckCircle2,
  ChevronDown,
  CloudOff,
  Loader2,
  Menu,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSheets } from "@/context/SheetsContext";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const titleMap: Record<string, string> = {
  "/overview": "Overview",
  "/campaigns": "Campaigns",
  "/kols": "KOL Database",
  "/reports": "Reports",
  "/applications": "Applications",
  "/settings": "Settings",
};

/**
 * Small live indicator so the marketer knows whether their work is saved.
 *
 * It is always visible — it used to disappear on small screens, which is
 * exactly where a failed sync went unnoticed — and it matches the colour of
 * the sync banner. Clicking it opens Settings, where the sheet is configured.
 */
const SyncIndicator = () => {
  const { enabled, status } = useSheets();
  const navigate = useNavigate();

  const openSettings = () => navigate("/settings");

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={openSettings}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
        title="Not connected to Google Sheets — open Settings"
      >
        <CloudOff size={13} />
        Not connected
      </button>
    );
  }

  if (status === "loading" || status === "syncing") {
    return (
      <button
        type="button"
        onClick={openSettings}
        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
        title="Syncing with Google Sheets — open Settings"
      >
        <Loader2 size={13} className="animate-spin" />
        Syncing
      </button>
    );
  }
  if (status === "error") {
    return (
      <button
        type="button"
        onClick={openSettings}
        className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800"
        title="Google Sheets sync failed — open Settings"
      >
        <CloudOff size={13} />
        Sync failed
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSettings}
      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800"
      title="Synced with Google Sheets — open Settings"
    >
      <CheckCircle2 size={13} />
      Sheet synced
    </button>
  );
};

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { pathname } = useLocation();
  const title = pathname.startsWith("/campaigns/")
    ? "Campaign pipeline"
    : (titleMap[pathname] ?? "Dashboard");

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Toggle sidebar"
          className="text-slate-500 hover:text-slate-700"
          onClick={onToggleSidebar}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <SyncIndicator />
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search campaigns, KOLs..."
            aria-label="Search campaigns and KOLs"
            className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 outline-none transition-all w-64"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative text-slate-500 hover:text-slate-700"
        >
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 sm:pl-6">
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-slate-700 leading-none">Marketing Admin</p>
            <p className="text-slate-500 text-xs mt-1">FX Creations HK</p>
          </div>
          <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

export default Header;
