import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import PageContainer from "@/components/layout/PageContainer";
import Sidebar from "@/components/layout/Sidebar";
import { navItems } from "@/data/mockData";

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
          <Outlet />
        </PageContainer>
      </main>
    </div>
  );
};

export default DashboardLayout;
