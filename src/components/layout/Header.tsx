import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const titleMap: Record<string, string> = {
  "/overview": "Overview",
  "/campaigns": "Campaigns",
  "/kols": "KOL Database",
  "/reports": "Reports",
  "/applications": "Applications",
};

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { pathname } = useLocation();
  const title = titleMap[pathname] ?? "Dashboard";

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
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search campaigns, KOLs..."
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
