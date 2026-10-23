/* eslint-disable no-console */
/**
 * Server-side smoke test: renders every route through React and fails on any
 * render-time error or missing content. Run with:
 *   npx vite build --ssr scripts/smoke.tsx --outDir dist-smoke && node dist-smoke/smoke.js
 */
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { KolProvider } from "@/context/KolContext";
import { CampaignsProvider } from "@/context/CampaignsContext";
import { ApplicationsProvider } from "@/context/ApplicationsContext";
import { MessageTemplatesProvider } from "@/components/shared/MessageTemplatesProvider";
import PublicCampaignPage from "@/pages/public/PublicCampaignPage";
import CampaignDetailPage from "@/pages/CampaignDetailPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import KolsPage from "@/pages/KolsPage";
import CampaignsPage from "@/pages/CampaignsPage";
import OverviewPage from "@/pages/OverviewPage";
import ReportsPage from "@/pages/ReportsPage";
import PostCaptureForm from "@/components/applications/PostCaptureForm";
import ApplicationMessagePanel from "@/components/applications/ApplicationMessagePanel";
import MessageTemplatesDialog from "@/components/applications/MessageTemplatesDialog";
import NewCampaignDialog from "@/components/campaigns/NewCampaignDialog";
import KolProfileDialog from "@/components/kols/KolProfileDialog";
import { seedApplications } from "@/data/seedApplications";
import { seedKols } from "@/data/seedKols";
import { seedCampaigns } from "@/data/mockData";

const routes = (
  <Routes>
    <Route path="/c/:slug" element={<PublicCampaignPage />} />
    <Route path="/campaigns" element={<CampaignsPage />} />
    <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
    <Route path="/kols" element={<KolsPage />} />
    <Route path="/applications" element={<ApplicationsPage />} />
    <Route path="/overview" element={<OverviewPage />} />
    <Route path="/reports" element={<ReportsPage />} />
    <Route path="*" element={<div>not found</div>} />
  </Routes>
);

const wrap = (path: string, override?: ReactNode): ReactNode => (
  <MemoryRouter initialEntries={[path]}>
    <KolProvider>
      <CampaignsProvider>
        <ApplicationsProvider>
          <MessageTemplatesProvider>{override ?? routes}</MessageTemplatesProvider>
        </ApplicationsProvider>
      </CampaignsProvider>
    </KolProvider>
  </MemoryRouter>
);

const cases: { name: string; path: string; expect: string[] }[] = [
  {
    name: "public campaign (open)",
    path: "/c/summer-collection-2026",
    expect: ["AGS Pro Backpack", "Apply to this campaign", "Submit application"],
  },
  {
    name: "public campaign (closed)",
    path: "/c/holiday-gift-guide-2026",
    expect: ["Applications closed"],
  },
  {
    name: "public campaign (missing)",
    path: "/c/nope",
    expect: ["Campaign not found"],
  },
  {
    name: "campaign board",
    path: "/campaigns/1",
    expect: ["Summer Collection Launch", "Pipeline", "Funnel", "Applied", "Rejected"],
  },
  {
    name: "campaign board (missing)",
    path: "/campaigns/999",
    expect: ["Campaign not found"],
  },
  {
    name: "applications",
    path: "/applications",
    expect: ["Applications", "Elena H.", "Message templates"],
  },
  {
    name: "kols",
    path: "/kols",
    expect: ["KOL Database", "Post history", "Elena H."],
  },
  {
    name: "campaigns",
    path: "/campaigns",
    expect: ["Campaigns", "Summer Collection Launch", "View"],
  },
  {
    name: "overview",
    path: "/overview",
    expect: ["Dashboard Overview", "Top Performing KOLs"],
  },
  {
    name: "reports",
    path: "/reports",
    expect: ["Reports"],
  },
];

// Components that are mounted behind a click (dialogs, capture form, panels).
const liveApplication =
  seedApplications.find((a) => a.status === "Content Live") ?? seedApplications[0];
const liveKol = seedKols.find((k) => k.id === liveApplication.kolId) ?? seedKols[0];
const liveCampaign =
  seedCampaigns.find((c) => c.id === liveApplication.campaignId) ?? seedCampaigns[0];

const componentCases: { name: string; node: ReactNode; expect: string[] }[] = [
  {
    name: "post capture form",
    node: (
      <PostCaptureForm
        application={liveApplication}
        kol={liveKol}
        campaign={liveCampaign}
      />
    ),
    expect: ["Post URL", "Metrics", "Save post data"],
  },
  {
    name: "message panel",
    node: (
      <ApplicationMessagePanel
        application={liveApplication}
        kol={liveKol}
        campaign={liveCampaign}
      />
    ),
    expect: ["Copy message", "Open in WhatsApp", "Sent history"],
  },
  {
    name: "message templates dialog",
    node: <MessageTemplatesDialog onClose={() => undefined} />,
    expect: ["Message templates", "Variables", "Preview"],
  },
  {
    name: "new campaign dialog (create)",
    node: <NewCampaignDialog mode={{ kind: "create" }} onClose={() => undefined} />,
    expect: ["New campaign", "Basics", "Product", "Targeting", "Money"],
  },
  {
    name: "new campaign dialog (edit)",
    node: (
      <NewCampaignDialog
        mode={{ kind: "edit", campaign: liveCampaign }}
        onClose={() => undefined}
      />
    ),
    expect: [
      "Edit campaign",
      liveCampaign.name,
      liveCampaign.campaignCode,
      liveCampaign.manager,
      liveCampaign.budget,
    ],
  },
  {
    name: "kol profile dialog",
    node: <KolProfileDialog kol={liveKol} onClose={() => undefined} />,
    expect: ["Post history", "Rate card", "Followers"],
  },
];

let failures = 0;

for (const testCase of cases) {
  try {
    const html = renderToString(wrap(testCase.path));
    const missing = testCase.expect.filter((needle) => !html.includes(needle));
    if (missing.length > 0) {
      failures += 1;
      console.error(`FAIL  ${testCase.name} (${testCase.path}) — missing: ${missing.join(", ")}`);
    } else {
      console.log(`OK    ${testCase.name} (${testCase.path}) — ${html.length} chars`);
    }
  } catch (error) {
    failures += 1;
    console.error(`FAIL  ${testCase.name} (${testCase.path})`);
    console.error(error);
  }
}

for (const testCase of componentCases) {
  try {
    const html = renderToString(wrap("/applications", testCase.node));
    const missing = testCase.expect.filter((needle) => !html.includes(needle));
    if (missing.length > 0) {
      failures += 1;
      console.error(`FAIL  ${testCase.name} — missing: ${missing.join(", ")}`);
    } else {
      console.log(`OK    ${testCase.name} — ${html.length} chars`);
    }
  } catch (error) {
    failures += 1;
    console.error(`FAIL  ${testCase.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  console.error(`\n${failures} smoke test(s) failed.`);
  process.exit(1);
}

console.log("\nAll smoke tests passed.");
