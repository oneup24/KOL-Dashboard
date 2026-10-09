import type { Application } from "@/types";
import PlatformBadge from "@/components/shared/PlatformBadge";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import { Mail, MapPin, MessageCircle, Tag } from "lucide-react";
import { findStore } from "@/data/stores";

interface ApplicationRowProps {
  application: Application;
  campaignName: string;
  selected: boolean;
  onSelect: () => void;
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const ApplicationRow = ({ application, campaignName, selected, onSelect }: ApplicationRowProps) => {
  const store = findStore(application.pickupStoreId);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 sm:p-5 flex flex-col gap-3 transition-colors border-l-2 ${
        selected
          ? "bg-violet-50/60 border-violet-500"
          : "border-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-slate-800 truncate">{application.kolName}</h4>
            <ApplicationStatusBadge status={application.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {application.socialHandle} · {application.followers || "—"}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 whitespace-nowrap mt-1">
          {formatDate(application.appliedAt)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <PlatformBadge platform={application.socialPlatform} />
        <span className="inline-flex items-center gap-1">
          <Tag size={12} /> {campaignName}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} /> {store?.district ?? "—"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={12} /> {application.whatsapp}
        </span>
        <span className="inline-flex items-center gap-1 min-w-0">
          <Mail size={12} className="flex-shrink-0" />
          <span className="truncate max-w-[180px]">{application.email}</span>
        </span>
      </div>
    </button>
  );
};

export default ApplicationRow;
