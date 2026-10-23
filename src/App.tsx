import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { KolProvider } from "@/context/KolContext";
import { CampaignsProvider } from "@/context/CampaignsContext";
import { ApplicationsProvider } from "@/context/ApplicationsContext";
import { SheetsProvider } from "@/context/SheetsContext";
import { MessageTemplatesProvider } from "@/components/shared/MessageTemplatesProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import OverviewPage from "@/pages/OverviewPage";
import CampaignsPage from "@/pages/CampaignsPage";
import CampaignDetailPage from "@/pages/CampaignDetailPage";
import KolsPage from "@/pages/KolsPage";
import ReportsPage from "@/pages/ReportsPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import SettingsPage from "@/pages/SettingsPage";
import PublicCampaignPage from "@/pages/public/PublicCampaignPage";
import NotFoundPage from "@/pages/NotFoundPage";

/**
 * Provider nesting matters:
 *   SheetsProvider     — Google Sheets sync (config + snapshot)
 *     KolProvider        — master CRM record (no dependencies)
 *       CampaignsProvider — campaign list (no dependencies)
 *         ApplicationsProvider — reads useKol() + useCampaigns()
 *           MessageTemplatesProvider — editable template copy
 *             HashRouter
 */
const App = () => (
  <SheetsProvider>
    <KolProvider>
      <CampaignsProvider>
        <ApplicationsProvider>
          <MessageTemplatesProvider>
            <HashRouter>
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
                  <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
                  <Route path="/kols" element={<KolsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/applications" element={<ApplicationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </HashRouter>
          </MessageTemplatesProvider>
        </ApplicationsProvider>
      </CampaignsProvider>
    </KolProvider>
  </SheetsProvider>
);

export default App;
