import { Link } from "react-router-dom";

interface PublicHeaderProps {
  campaignName?: string;
}

const PublicHeader = ({ campaignName }: PublicHeaderProps) => (
  <header className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-30">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">
          FX
        </div>
        <div className="leading-none">
          <p className="font-bold text-slate-800 text-sm tracking-tight">FX Creations</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">KOL Program</p>
        </div>
      </Link>
      <div className="text-xs sm:text-sm text-slate-500 hidden sm:block">
        {campaignName ? <span>Campaign: <span className="text-slate-700 font-medium">{campaignName}</span></span> : null}
      </div>
    </div>
  </header>
);

export default PublicHeader;
