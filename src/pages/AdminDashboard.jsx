import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const nav = useNavigate();

  const loadReports = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/reports", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load reports");
      setReports(await res.json());
    } catch (e) {
      setErr(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const logout = async () => {
    await fetch("http://localhost:5000/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    nav("/admin/login");
  };

  const deleteReport = async (id) => {
    if (!confirm("Delete this report? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reports/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");

      setReports((prev) => prev.filter((r) => r._id !== id));
      if (openId === id) setOpenId(null);
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">{reports.length} reports</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadReports}
              className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm hover:bg-slate-900"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>

        {loading && <p className="mt-6 text-slate-300">Loading…</p>}
        {err && <p className="mt-6 text-red-400">{err}</p>}

        {!loading && !err && (
          <div className="mt-6 space-y-3">
            {reports.map((r) => {
              const isOpen = openId === r._id;

              const preview =
                r.address?.road
                  ? `${r.address.road}${r.address.city ? `, ${r.address.city}` : ""}`
                  : r.address?.displayName || "No address found";

              const coords =
                r.location?.latitude != null && r.location?.longitude != null
                  ? `${Number(r.location.latitude).toFixed(6)}, ${Number(r.location.longitude).toFixed(6)}`
                  : "—";

              return (
                <div key={r._id} className="rounded-2xl border border-slate-800 bg-slate-900/30">
                  <button
                    className="w-full text-left px-4 py-4"
                    onClick={() => setOpenId(isOpen ? null : r._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                        <p className="mt-1 font-medium">{preview}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Coords: {coords}{" "}
                          {r.location?.accuracy != null ? `(±${Math.round(r.location.accuracy)}m)` : ""}
                        </p>
                        
                      </div>

                      <span className="mt-1 inline-flex items-center rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                        {isOpen ? "Hide" : "View"}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-800 px-4 py-4">
                      <div className="grid gap-2 text-sm text-slate-200">
                        <div><span className="text-slate-400">Address:</span> {r.address?.displayName || "—"}</div>
                        <div><span className="text-slate-400">Postcode:</span> {r.address?.postcode || "—"}</div>
                        <div><span className="text-slate-400">Country:</span> {r.address?.country || "—"}</div>
                        {r.photo?.data && (
  <img
    src={`data:${r.photo.mimeType};base64,${r.photo.data}`}
    alt="Pothole report"
    className="mt-4 w-full max-w-sm rounded-xl border border-slate-700"
  />
)}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => deleteReport(r._id)}
                          disabled={deletingId === r._id}
                          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
                        >
                          {deletingId === r._id ? "Deleting…" : "Delete"}
                        </button>

                        <button
                          onClick={() => navigator.clipboard?.writeText(`${r.location?.latitude},${r.location?.longitude}`)}
                          className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm hover:bg-slate-900"
                        >
                          Copy coords
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}