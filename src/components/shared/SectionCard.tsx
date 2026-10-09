import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

const SectionCard = ({
  title,
  description,
  action,
  children,
  className = "",
  noPadding,
}: SectionCardProps) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}
  >
    {title || action || description ? (
      <div
        className={`flex justify-between items-start border-b border-slate-100 ${
          noPadding ? "" : "px-6 py-4"
        }`}
      >
        <div>
          {title ? <h3 className="text-lg font-bold text-slate-800">{title}</h3> : null}
          {description ? (
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          ) : null}
        </div>
        {action ?? null}
      </div>
    ) : null}
    <div className={noPadding ? "" : "p-6"}>{children}</div>
  </div>
);

export default SectionCard;
