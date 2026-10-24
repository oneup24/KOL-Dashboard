import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { KolProvider } from "@/context/KolContext";
import { CampaignsProvider } from "@/context/CampaignsContext";
import { ApplicationsProvider } from "@/context/ApplicationsContext";
import { SheetsProvider } from "@/context/SheetsContext";
import { MessageTemplatesProvider } from "@/components/shared/MessageTemplatesProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardGate from "@/components/layout/DashboardGate";
import PublicLayout from "@/components/layout/PublicLayout";
import PublicPathRedirect, { normalizePublicPath } from "@/components/PublicPathRedirect";
import SeedOnConnect from "@/components/SeedOnConnect";
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
 * The public share link is a real path on the host (`/c/<slug>/`) while the
 * app routes on the hash. Normalise the fragment before the router is built
 * so the first paint is already the public page — a KOL following the link
 * never sees the dashboard chrome flash past.
 */
normalizePublicPath();

/**
 * Provider nesting matters:
 *   SheetsProvider     — Google Sheets sync (config + snapshot)
 *     KolProvider        — master CRM record (no dependencies)
 *       CampaignsProvider — campaign list (no dependencies)
 *         ApplicationsProvider — reads useKol() + useCampaigns()
 *           SeedOnConnect — writes the demo records into a freshly connected,
 *                           still-empty sheet (reads all three contexts)
 *           MessageTemplatesProvider — editable template copy
 *             HashRouter
 */
const App = () => (
  <SheetsProvider>
    <KolProvider>
      <CampaignsProvider>
        <ApplicationsProvider>
          <SeedOnConnect />
          <MessageTemplatesProvider>
            <HashRouter>
              <PublicPathRedirect />
              <Routes>
                {/* Public KOL-facing campaign page — no dashboard chrome and
                    never behind the access code: a KOL has no code. */}
                <Route element={<PublicLayout />}>
                  <Route path="/c/:slug" element={<PublicCampaignPage />} />
                </Route>

                {/* Marketer dashboard — behind the access code when one is
                    configured. The gate sits OUTSIDE the layout so the lock
                    screen has no dashboard chrome around it. */}
                <Route element={<DashboardGate />}>
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
