import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => (
  <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">{children}</div>
);

export default PageContainer;
