import { useState } from "react";
import TrafficCone from "../assets/TrafficCone";

const ReportPage = () => {
  const [pos, setPos] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const submitReport = async ({ geoInfo }) => {
    const payload = {
      source: "gps",
      location: {
        latitude: geoInfo.latitude,
        longitude: geoInfo.longitude,
        accuracy: geoInfo.accuracy,
        timestamp: geoInfo.timestamp,
      },
    };

    const res = await fetch(`${API_BASE}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Submit failed (${res.status}): ${text}`);

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const getGpsLocation = () => {
    setError("");
    setLoading(true);

    
    if (!("geolocation" in navigator)) {
      setLoading(false);
      setError("Geolocation is not supported on this device/browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          const geoData = {
            latitude,
            longitude,
            accuracy,
            timestamp: new Date(position.timestamp).toISOString(),
          };

          setPos(geoData);
const saved = await submitReport({
  ipAddress: "auto",
  geoInfo: geoData,
});

setAddress(saved.address);
          // Server already reverse-geocodes + stores address
          await submitReport({ geoInfo: geoData });
        } catch (err) {
          console.error(err);
          setError("Failed to submit report.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) setError("Location permission denied.");
        else if (err.code === err.POSITION_UNAVAILABLE) setError("Location unavailable.");
        else if (err.code === err.TIMEOUT) setError("Location request timed out.");
        else setError("Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
      <button
        onClick={getGpsLocation}
        disabled={loading}
        className="w-full rounded-2xl bg-orange-500 px-4 py-4 text-slate-950 font-semibold hover:bg-orange-400 disabled:opacity-60 flex items-center justify-center"
        aria-label="Report pothole"
      >
        {loading ? "Getting GPS…" : <TrafficCone />}
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {pos && (
  <div className="mt-4 text-sm text-slate-200 space-y-1">
    <h2 className="text-green-400 font-bold">Report Submitted</h2>

    {address && (
      <>
        <p>
          Location: {address.road}, {address.city}
        </p>
        <p>Postcode: {address.postcode}</p>
      </>
    )}

    <p>Accuracy: {Math.round(pos.accuracy)} m</p>
    <p>Time: {pos.timestamp}</p>
  </div>
)}
    </div>
  );
};

export default ReportPage;