import { useEffect, useMemo, useState } from "react";
import { Inbox, MessageSquare, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ApplicationDetailPanel from "@/components/applications/ApplicationDetailPanel";
import ApplicationRow from "@/components/applications/ApplicationRow";
import MessageTemplatesDialog from "@/components/applications/MessageTemplatesDialog";
import ExportMenu from "@/components/shared/ExportMenu";
import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";
import { useApplications } from "@/context/ApplicationsContext";
import { useCampaigns } from "@/context/CampaignsContext";
import { useKol } from "@/context/KolContext";
import { useSheets } from "@/context/SheetsContext";
import { findStore } from "@/data/stores";
import type { ExportRow } from "@/utils/export";
import type { Application, ApplicationStatus, Campaign, Kol } from "@/types";

const statusFilters: ("All" | ApplicationStatus)[] = [
  "All",
  "New",
  "Reviewing",
  "Approved",
  "Product Ready",
  "Picked Up",
  "Brief Sent",
  "Content Live",
  "Completed",
  "Rejected",
];

const ApplicationsPage = () => {
  const { applications } = useApplications();
  const { getById: getCampaignById } = useCampaigns();
  const { kols } = useKol();
  const { pushAll } = useSheets();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<"All" | ApplicationStatus>("All");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    applications[0]?.id ?? null,
  );

  const urlSelectedId = searchParams.get("app");

  useEffect(() => {
    if (urlSelectedId) setSelectedId(urlSelectedId);
  }, [urlSelectedId]);

  // Contact details live on the CRM records — index them for search.
  const kolById = useMemo(() => {
    const map = new Map<number, Kol>();
    for (const kol of kols) map.set(kol.id, kol);
    return map;
  }, [kols]);

  // One row per application, joined with the KOL, campaign and store details
  // so the export is readable straight in a sheet.
  const exportRows = useMemo<ExportRow[]>(
    () =>
      applications.map((a) => {
        const kol = kolById.get(a.kolId);
        const campaign = getCampaignById(a.campaignId);
        const store = findStore(a.pickupStoreId);
        return {
          "Application ID": a.id,
          Campaign: campaign?.name ?? "",
          "Campaign code": campaign?.campaignCode ?? "",
          "KOL name": kol?.name ?? "",
          Handle: kol?.handle ?? "",
          Platform: kol?.primaryPlatform ?? "",
          Followers: kol?.followers ?? 0,
          "Eng. rate %": kol?.er ?? 0,
          WhatsApp: kol?.whatsapp ?? "",
          Email: kol?.email ?? "",
          Status: a.status,
          Applied: a.appliedAt,
          "Promo code": a.promoCode ?? "",
          Discount: a.discountValue ?? "",
          "Pickup store": store?.name ?? "",
          "Post URL": a.postUrl ?? "",
          "Post type": a.postType ?? "",
          "Post date": a.postDate ?? "",
          Reach: a.postMetrics?.reach ?? "",
          Views: a.postMetrics?.views ?? "",
          Likes: a.postMetrics?.likes ?? "",
          Comments: a.postMetrics?.comments ?? "",
          "Post ER %": a.postMetrics?.er ?? "",
          "Reject reason": a.rejectReason ?? "",
          Notes: a.notes ?? "",
        };
      }),
    [applications, kolById, getCampaignById],
  );

  const filtered = useMemo<Application[]>(() => {
    const q = search.trim().toLowerCase();
    return applications
      .filter((a) => status === "All" || a.status === status)
      .filter((a) => {
        if (q.length === 0) return true;
        const c = getCampaignById(a.campaignId);
        const kol = kolById.get(a.kolId);
        return (
          (kol?.name.toLowerCase().includes(q) ?? false) ||
          (kol?.handle.toLowerCase().includes(q) ?? false) ||
          (kol?.email.toLowerCase().includes(q) ?? false) ||
          (kol?.whatsapp.includes(q) ?? false) ||
          (kol?.niches.some((n) => n.toLowerCase().includes(q)) ?? false) ||
          (c?.name.toLowerCase().includes(q) ?? false)
        );
      });
  }, [applications, search, status, getCampaignById, kolById]);

  const selected: Application | null = useMemo(() => {
    if (!selectedId) return null;
    return (
      filtered.find((a) => a.id === selectedId) ??
      applications.find((a) => a.id === selectedId) ??
      null
    );
  }, [filtered, applications, selectedId]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: applications.length };
    for (const s of statusFilters) {
      if (s === "All") continue;
      counts[s] = applications.filter((a) => a.status === s).length;
    }
    return counts;
  }, [applications]);

  const findCampaign = (id: number): Campaign | undefined => getCampaignById(id);

  const select = (id: string | null) => {
    setSelectedId(id);
    if (id) setSearchParams({ app: id }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Inbox of KOL applications from the public campaign pages."
        actions={
          <>
            <button
              type="button"
              onClick={() => setTemplatesOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              <MessageSquare size={16} /> Message templates
            </button>
            <ExportMenu
              rows={exportRows}
              filename="kol-applications"
              onPushToSheet={() => pushAll("applications", applications)}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search KOLs, campaigns, emails..."
                aria-label="Search applications by KOL, campaign, email or WhatsApp"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {filtered.length} of {applications.length} application
              {applications.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {statusFilters.map((s) => {
              const active = status === s;
              const count = statusCounts[s] ?? 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s === "All" ? <Inbox size={12} /> : <Dot />}
                  {s}
                  <span
                    className={`text-[10px] font-bold rounded-full px-1.5 ${
                      active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <SectionCard noPadding>
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                  <Inbox size={24} />
                </div>
                <p className="mt-3 text-sm text-slate-500">No applications match your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[calc(100vh-22rem)] overflow-auto scrollbar-thin">
                {filtered.map((a) => {
                  const c = findCampaign(a.campaignId);
                  return (
                    <ApplicationRow
                      key={a.id}
                      application={a}
                      campaignName={c?.name ?? "—"}
                      selected={selectedId === a.id}
                      onSelect={() => select(a.id)}
                    />
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-6rem)]">
          {selected ? (
            // Keyed by application id so the panel's local state (promo code,
            // reject reason, active tab) never leaks into another application.
            <ApplicationDetailPanel
              key={selected.id}
              application={selected}
              onClose={() => select(null)}
            />
          ) : (
            <SectionCard>
              <div className="py-16 text-center">
                <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                  <Inbox size={24} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">Select an application</p>
                <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                  Pick a KOL from the list to see contact info, pickup details, and the workflow
                  actions.
                </p>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {templatesOpen ? <MessageTemplatesDialog onClose={() => setTemplatesOpen(false)} /> : null}
    </div>
  );
};

const Dot = () => (
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
);

export default ApplicationsPage;
