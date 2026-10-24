import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import PageContainer from "@/components/layout/PageContainer";
import Sidebar from "@/components/layout/Sidebar";
import SyncBanner from "@/components/shared/SyncBanner";
import { navItems } from "@/data/dashboardMeta";

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <PageContainer>
          {/* The sync state is never hidden — a write that failed silently
              used to cost the marketer a campaign. */}
          <div className="space-y-4">
            <SyncBanner />
            <Outlet />
          </div>
        </PageContainer>
      </main>
    </div>
  );
};

export default DashboardLayout;
