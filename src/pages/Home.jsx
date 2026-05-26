import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const STATUS = {
  IDLE: "idle",
  LOCATING: "locating",
  SUBMITTING: "submitting",
  SUCCESS: "success",
  ERROR: "error",
};

export default function Home() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [statusText, setStatusText] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [error, setError] = useState("");

  const handleReport = () => {
    setStatus(STATUS.LOCATING);
    setStatusText("Getting your location…");
    setError("");
    setSubmittedAddress("");

    if (!("geolocation" in navigator)) {
      setStatus(STATUS.ERROR);
      setError("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = new Date(position.timestamp).toISOString();

        setStatus(STATUS.SUBMITTING);
        setStatusText("Submitting report…");

        try {
          let geocode = null;
          try {
            const geoRes = await fetch(
              `${API_BASE}/api/reports/reverse-geocode?lat=${latitude}&lon=${longitude}`
            );
            if (geoRes.ok) geocode = await geoRes.json();
          } catch {
            // non-fatal — submit without address
          }

          const formData = new FormData();
          formData.append("source", "gps");
          formData.append("latitude", latitude);
          formData.append("longitude", longitude);
          formData.append("accuracy", accuracy);
          formData.append("timestamp", timestamp);
          if (geocode?.displayName) formData.append("displayName", geocode.displayName);

          const res = await fetch(`${API_BASE}/api/reports`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error(`Submit failed (${res.status})`);

          setSubmittedAddress(geocode?.displayName || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          setStatus(STATUS.SUCCESS);
        } catch (err) {
          setStatus(STATUS.ERROR);
          setError(err.message || "Failed to submit report.");
        }
      },
      (err) => {
        setStatus(STATUS.ERROR);
        if (err.code === err.PERMISSION_DENIED) setError("Location permission denied.");
        else if (err.code === err.POSITION_UNAVAILABLE) setError("Location unavailable.");
        else if (err.code === err.TIMEOUT) setError("Location request timed out.");
        else setError("Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const reset = () => {
    setStatus(STATUS.IDLE);
    setStatusText("");
    setError("");
    setSubmittedAddress("");
  };

  const busy = status === STATUS.LOCATING || status === STATUS.SUBMITTING;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-4 py-6">

        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Pothole Report</h1>
          <div className="flex gap-2">
            <Link
              to="/report"
              className="rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              Full Report
            </Link>
            <Link
              to="/admin/login"
              className="rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              Admin
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-6">

          {status === STATUS.SUCCESS ? (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-green-400">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-green-400">Report submitted</p>
                <p className="mt-1 text-sm text-slate-400">{submittedAddress}</p>
              </div>
              <button
                onClick={reset}
                className="rounded-2xl border border-slate-700 px-6 py-3 text-sm hover:bg-slate-900"
              >
                Report another
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReport}
                disabled={busy}
                className="flex h-44 w-44 flex-col items-center justify-center rounded-full bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 active:scale-95 disabled:opacity-60 disabled:active:scale-100"
              >
                {busy ? (
                  <svg className="h-10 w-10 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
                      <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.083 3.545-4.976 3.545-8.827a8.25 8.25 0 0 0-16.5 0c0 3.851 1.601 6.744 3.545 8.827a19.58 19.58 0 0 0 2.683 2.282 16.975 16.975 0 0 0 1.144.742zM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" clipRule="evenodd" />
                    </svg>
                    <span className="mt-2 text-sm font-bold">Report Pothole</span>
                  </>
                )}
              </button>

              {busy && (
                <p className="text-sm text-slate-400">{statusText}</p>
              )}

              {status === STATUS.ERROR && (
                <div className="text-center">
                  <p className="text-sm text-red-400">{error}</p>
                  <button onClick={reset} className="mt-2 text-sm text-slate-400 underline">
                    Try again
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
