import { Outlet } from "react-router-dom";

const PublicLayout = () => (
  <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
    <Outlet />
  </div>
);

export default PublicLayout;
