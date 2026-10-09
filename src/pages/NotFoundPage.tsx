import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const NotFoundPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
          <Compass size={28} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">
          The page you were looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/overview"
          className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
