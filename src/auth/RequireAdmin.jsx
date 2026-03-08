import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:5000/api/admin/me", {
        credentials: "include",
      });
      setOk(res.ok);
    })();
  }, []);

  if (ok === null) return <div className="min-h-screen bg-slate-950 text-slate-100 p-6">Loading…</div>;
  return ok ? children : <Navigate to="/admin/login" replace />;
}