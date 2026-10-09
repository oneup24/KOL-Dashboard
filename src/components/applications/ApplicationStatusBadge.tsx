import type { ApplicationStatus } from "@/types";

const statusStyles: Record<ApplicationStatus, string> = {
  New: "bg-rose-100 text-rose-700 border-rose-200",
  Reviewing: "bg-blue-100 text-blue-700 border-blue-200",
  "Product Ready": "bg-amber-100 text-amber-700 border-amber-200",
  "Picked Up": "bg-violet-100 text-violet-700 border-violet-200",
  "Brief Sent": "bg-indigo-100 text-indigo-700 border-indigo-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejected: "bg-slate-100 text-slate-500 border-slate-200 line-through",
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const ApplicationStatusBadge = ({ status }: ApplicationStatusBadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${statusStyles[status]}`}
  >
    {status}
  </span>
);

export default ApplicationStatusBadge;
