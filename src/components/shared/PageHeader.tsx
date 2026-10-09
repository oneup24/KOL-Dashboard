import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      {description ? <p className="text-slate-500 text-sm mt-1">{description}</p> : null}
    </div>
    {actions ? <div className="flex gap-2 w-full sm:w-auto">{actions}</div> : null}
  </div>
);

export default PageHeader;
