import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Clock, MessageCircle, Users } from "lucide-react";
import { useApplications } from "@/context/ApplicationsContext";
import { useKol } from "@/context/KolContext";
import { useMessageTemplates } from "@/components/shared/MessageTemplatesProvider";
import { buildMessageVars, renderTemplate } from "@/data/messageTemplates";
import { formatFollowers } from "@/data/seedKols";
import PlatformBadge from "@/components/shared/PlatformBadge";
import {
  PIPELINE_STAGES,
  STAGE_LABELS,
  daysSince,
  nextPipelineStage,
  scopeForStatus,
  stageNote,
  stageTimestamp,
  whatsappLink,
} from "@/components/shared/workflow";
import type { ApplicationStatus, Campaign } from "@/types";

interface CampaignBoardProps {
  campaign: Campaign;
}

const boardStages: ApplicationStatus[] = [...PIPELINE_STAGES, "Rejected"];

const CampaignBoard = ({ campaign }: CampaignBoardProps) => {
  const { applications, updateStatus } = useApplications();
  const { getById: getKolById } = useKol();
  const { templates } = useMessageTemplates();

  const applicationsForCampaign = useMemo(
    () => applications.filter((a) => a.campaignId === campaign.id),
    [applications, campaign.id],
  );

  const target = Math.max(1, campaign.targetKolCount);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {boardStages.map((stage) => {
        const columnApps = applicationsForCampaign.filter((a) => a.status === stage);
        const percentage = Math.round((columnApps.length / target) * 100);
        const isTerminal = stage === "Rejected";

        return (
          <div
            key={stage}
            className={`w-[280px] flex-shrink-0 rounded-xl border bg-slate-50/70 ${
              isTerminal ? "border-rose-100" : "border-slate-100"
            }`}
          >
            <div
              className={`px-4 py-3 border-b rounded-t-xl ${
                isTerminal ? "bg-rose-50 border-rose-100" : "bg-white border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {STAGE_LABELS[stage]}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <Users size={12} /> {columnApps.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {percentage}% of {campaign.targetKolCount} target
              </p>
            </div>

            <div className="p-2 space-y-2 min-h-[120px]">
              {columnApps.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Empty</p>
              ) : (
                columnApps.map((application) => {
                  const kol = getKolById(application.kolId);
                  const next = nextPipelineStage(application.status);
                  const days = daysSince(stageTimestamp(application, application.status));
                  const scope = scopeForStatus(application.status);
                  const template =
                    templates.find((t) => t.scope === scope && t.isDefault) ??
                    templates.find((t) => t.scope === scope);
                  const vars = buildMessageVars({ application, kol, campaign });
                  const body = template
                    ? renderTemplate(template.body, {
                        ...vars,
                        stage_note: stageNote(application.status),
                      })
                    : "";
                  const messageLink = kol?.whatsapp
                    ? whatsappLink(kol.whatsapp, body)
                    : null;

                  return (
                    <div
                      key={application.id}
                      className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {kol?.name ?? "Unknown KOL"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            @{kol?.handle ?? "—"} · {formatFollowers(kol?.followers ?? 0)}
                          </p>
                        </div>
                        {kol ? <PlatformBadge platform={kol.primaryPlatform} /> : null}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} /> {days === null ? "—" : `${days}d`} in stage
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5">
                        {messageLink ? (
                          <a
                            href={messageLink}
                            target="_blank"
                            rel="noreferrer noopener"
                            title="Send the stage message on WhatsApp"
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-medium"
                          >
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        ) : null}
                        {next ? (
                          <button
                            type="button"
                            onClick={() => updateStatus(application.id, next)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-medium"
                          >
                            {next === "Reviewing" ? "Reopen" : next}
                            <ChevronRight size={12} />
                          </button>
                        ) : null}
                        <Link
                          to={`/applications?app=${application.id}`}
                          className="ml-auto text-[11px] font-medium text-slate-500 hover:text-slate-800"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampaignBoard;
