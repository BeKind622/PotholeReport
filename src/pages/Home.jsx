import { Link } from "react-router-dom";
import ReportPage from "./ReportPage";
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Pothole Report </h1>

          <Link
            to="/admin/login"
            className="rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900"
          >
            Admin Login
          </Link>
        </div>

        <div className="mt-6">
          <ReportPage />
        </div>
      </div>
    </div>
  );
}