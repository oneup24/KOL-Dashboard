import { NavLink } from "react-router-dom";
import { Download, Star, X } from "lucide-react";
import { useApplications } from "@/context/ApplicationsContext";
import type { TabId } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { id: TabId; name: string; icon: typeof Star }[];
}

const Sidebar = ({ isOpen, onClose, navItems }: SidebarProps) => {
  const { newCount } = useApplications();
  return (
    <aside
      className={`bg-white border-r border-slate-200 w-64 flex-shrink-0 transition-all duration-300 fixed md:relative z-20 h-full ${
        isOpen ? "ml-0" : "-ml-64"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-xl">
            FX
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">Creations</span>
        </div>
        <button
          type="button"
          aria-label="Close sidebar"
          className="md:hidden text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-2 px-3">
          Menu
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge = item.id === "applications" && newCount > 0 ? newCount : undefined;
            return (
              <NavLink
                key={item.id}
                to={`/${item.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.name}</span>
                {badge ? (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8 px-3">
          Tools
        </div>
        <nav className="space-y-1">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Star size={18} /> Watchlist
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Download size={18} /> Export Data
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
