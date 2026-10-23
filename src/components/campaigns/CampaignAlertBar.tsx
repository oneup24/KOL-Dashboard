import { TriangleAlert } from "lucide-react";
import { useKol } from "@/context/KolContext";
import { daysSince } from "@/components/shared/workflow";
import type { Application, Campaign } from "@/types";

interface CampaignAlertBarProps {
  campaign: Campaign;
  applications: Application[];
}

interface Alert {
  tone: "red" | "amber";
  message: string;
}

const APPROVED_SLA_DAYS = 3;
const PICKED_UP_SLA_DAYS = 7;

/**
 * Deadline alerts for the campaign board:
 *   red   — the post window has closed but no post link was captured
 *   amber — an application is stuck in a stage for too long
 */
const CampaignAlertBar = ({ campaign, applications }: CampaignAlertBarProps) => {
  const { getById: getKolById } = useKol();

  const alerts: Alert[] = [];
  const now = Date.now();
  const postEnd = new Date(campaign.postEndDate).getTime();

  for (const application of applications) {
    const kol = getKolById(application.kolId);
    const name = kol?.name ?? "Unknown KOL";

    if (
      !application.postUrl &&
      Number.isFinite(postEnd) &&
      postEnd < now &&
      application.status !== "Rejected"
    ) {
      alerts.push({
        tone: "red",
        message: `${name} — the posting window closed on ${campaign.postEndDate} but no post link was captured.`,
      });
    }

    if (application.status === "Approved") {
      const days = daysSince(application.approvedAt);
      if (days !== null && days > APPROVED_SLA_DAYS) {
        alerts.push({
          tone: "amber",
          message: `${name} — approved ${days} days ago and still not product ready.`,
        });
      }
    }

    if (application.status === "Picked Up") {
      const days = daysSince(application.pickedUpAt);
      if (days !== null && days > PICKED_UP_SLA_DAYS) {
        alerts.push({
          tone: "amber",
          message: `${name} — picked up ${days} days ago and the brief has not been sent yet.`,
        });
      }
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
        <TriangleAlert size={16} className="flex-shrink-0" />
        No deadline issues — every application is inside its stage SLA.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
      {alerts.map((alert, index) => (
        <div
          key={`${alert.tone}-${index}`}
          className={`flex items-start gap-2 px-4 py-2.5 text-sm ${
            alert.tone === "red"
              ? "bg-rose-50 text-rose-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" />
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
};

export default CampaignAlertBar;
