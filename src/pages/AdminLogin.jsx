import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
        return;
      }

      nav("/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-4 py-10">
        <Link to="/" className="text-sm text-slate-300 hover:text-white">← Back</Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <h2 className="text-xl font-semibold">Admin Login</h2>
          <p className="mt-1 text-sm text-slate-400">Enter the admin password.</p>

          <label className="mt-5 block text-sm text-slate-300">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            onClick={login}
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-white px-4 py-2 font-medium text-slate-950 hover:bg-slate-100 disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}