import { useMemo, useState } from "react";
import { Inbox, Search } from "lucide-react";
import ApplicationDetailPanel from "@/components/applications/ApplicationDetailPanel";
import ApplicationRow from "@/components/applications/ApplicationRow";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";
import { useApplications } from "@/context/ApplicationsContext";
import { useCampaigns } from "@/context/CampaignsContext";
import type { Application, ApplicationStatus, Campaign } from "@/types";

const statusFilters: ("All" | ApplicationStatus)[] = [
  "All",
  "New",
  "Reviewing",
  "Product Ready",
  "Picked Up",
  "Brief Sent",
  "Completed",
  "Rejected",
];

const ApplicationsPage = () => {
  const { applications } = useApplications();
  const { getById: getCampaignById } = useCampaigns();
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<"All" | ApplicationStatus>("All");
  const [selectedId, setSelectedId] = useState<string | null>(
    applications[0]?.id ?? null,
  );

  const filtered = useMemo<Application[]>(() => {
    const q = search.trim().toLowerCase();
    return applications
      .filter((a) => status === "All" || a.status === status)
      .filter((a) => {
        if (q.length === 0) return true;
        const c = getCampaignById(a.campaignId);
        return (
          a.kolName.toLowerCase().includes(q) ||
          a.socialHandle.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.whatsapp.includes(q) ||
          (c?.name.toLowerCase().includes(q) ?? false)
        );
      });
  }, [applications, search, status, getCampaignById]);

  const selected: Application | null = useMemo(() => {
    if (!selectedId) return null;
    return filtered.find((a) => a.id === selectedId) ?? applications.find((a) => a.id === selectedId) ?? null;
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Inbox of KOL applications from the public campaign pages."
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
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {filtered.length} of {applications.length} application{applications.length === 1 ? "" : "s"}
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
                      onSelect={() => setSelectedId(a.id)}
                    />
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-6rem)]">
          {selected ? (
            <ApplicationDetailPanel
              application={selected}
              onClose={() => setSelectedId(null)}
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
    </div>
  );
};

const Dot = () => (
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
);

// Suppress unused import lint: ApplicationStatusBadge re-exported for type parity
void ApplicationStatusBadge;

export default ApplicationsPage;
