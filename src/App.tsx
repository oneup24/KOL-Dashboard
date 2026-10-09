import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ApplicationsProvider } from "@/context/ApplicationsContext";
import { CampaignsProvider } from "@/context/CampaignsContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import OverviewPage from "@/pages/OverviewPage";
import CampaignsPage from "@/pages/CampaignsPage";
import KolsPage from "@/pages/KolsPage";
import ReportsPage from "@/pages/ReportsPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import PublicCampaignPage from "@/pages/public/PublicCampaignPage";
import NotFoundPage from "@/pages/NotFoundPage";

const App = () => (
  <ApplicationsProvider>
    <CampaignsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public KOL-facing campaign page — no dashboard chrome */}
          <Route element={<PublicLayout />}>
            <Route path="/c/:slug" element={<PublicCampaignPage />} />
          </Route>

          {/* Marketer dashboard */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/kols" element={<KolsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </CampaignsProvider>
  </ApplicationsProvider>
);

export default App;
