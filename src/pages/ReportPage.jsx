import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const SEVERITY_LABELS = ["", "Minor", "Low", "Moderate", "Significant", "Severe"];
const SEVERITY_COLORS = ["", "text-green-400", "text-yellow-400", "text-orange-400", "text-red-400", "text-red-500"];
const DEFECT_LABELS = {
  pothole: "Pothole",
  crack: "Crack",
  subsidence: "Subsidence",
  edge_break: "Edge Break",
  surface_damage: "Surface Damage",
  other: "Other Defect",
};

const ReportPage = () => {
  const nav = useNavigate();
  const [pos, setPos] = useState(null);
  const [address, setAddress] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      setAnalysis(null);
      setAnalysisError("");
      return;
    }

    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);

    analyzePhoto(photo);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const analyzePhoto = async (file) => {
    setAnalyzing(true);
    setAnalysis(null);
    setAnalysisError("");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`${API_BASE}/api/reports/analyze-photo`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Analysis request failed");

      setAnalysis(result);
    } catch (err) {
      console.error("Photo analysis error:", err);
      setAnalysisError(`AI analysis unavailable: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const getGpsLocation = () => {
    setError("");
    setSuccess("");
    setAddress(null);
    setPos(null);
    setLoadingLocation(true);

    if (!("geolocation" in navigator)) {
      setLoadingLocation(false);
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

          const res = await fetch(
            `${API_BASE}/api/reports/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Reverse geocode failed (${res.status}): ${errorText}`);
          }

          const geo = await res.json();
          setAddress(geo);
        } catch (err) {
          console.error("Reverse geocode error:", err);
          setError(err.message || "Failed to get address from coordinates.");
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        setLoadingLocation(false);

        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location unavailable.");
        } else if (err.code === err.TIMEOUT) {
          setError("Location request timed out.");
        } else {
          setError("Could not get location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const submitReport = async () => {
    if (!pos) {
      setError("Get location before submitting.");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("source", "gps");
      formData.append("latitude", pos.latitude);
      formData.append("longitude", pos.longitude);
      formData.append("accuracy", pos.accuracy);
      formData.append("timestamp", pos.timestamp);

      if (address?.displayName) {
        formData.append("displayName", address.displayName);
      }

      if (photo) {
        formData.append("photo", photo);
      }

      if (analysis) {
        formData.append("aiAnalysis", JSON.stringify(analysis));
      }

      const res = await fetch(`${API_BASE}/api/reports`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(`Submit failed (${res.status}): ${text}`);
      }

      setSuccess("Report submitted successfully.");
      setPos(null);
      setAddress(null);
      setPhoto(null);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="mx-auto max-w-md px-4 py-6">
      <button
        onClick={() => nav("/")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M9.72 4.72a.75.75 0 0 1 0 1.06L5.81 10H21a.75.75 0 0 1 0 1.5H5.8l3.9 3.94a.75.75 0 1 1-1.08 1.04l-5.25-5.3a.75.75 0 0 1 0-1.04l5.25-5.3a.75.75 0 0 1 1.06 0z" clipRule="evenodd" />
        </svg>
        Back
      </button>
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
      <button
        onClick={getGpsLocation}
        disabled={loadingLocation}
        className="w-full rounded-2xl bg-orange-500 px-4 py-4 font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60"
      >
        {loadingLocation ? "Getting location..." : "Get Location"}
      </button>

      {pos && (
        <div className="mt-4 space-y-2 text-sm text-slate-200">
          <h2 className="font-bold text-green-400">Location captured</h2>
          <p>Accuracy: {Math.round(pos.accuracy)} m</p>
          <p>Time: {pos.timestamp}</p>
          {address?.displayName && (
            <p>Estimated address: {address.displayName}</p>
          )}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setPhoto(e.target.files[0] || null)}
        className="mt-4 block w-full text-sm text-slate-200"
      />

      {photoPreview && (
        <img
          src={photoPreview}
          alt="Selected pothole"
          className="mt-4 w-40 inline-block rounded-xl border border-slate-700"
        />
      )}

      {analyzing && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Analysing photo with AI...
        </div>
      )}

      {analysis && !analyzing && (
        <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">AI Analysis</p>
          {analysis.isRoadDefect ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">
                  {DEFECT_LABELS[analysis.defectType] ?? analysis.defectType ?? "Road defect"}
                </span>
                {analysis.severity != null && (
                  <span className={`font-semibold ${SEVERITY_COLORS[analysis.severity] ?? "text-slate-300"}`}>
                    · Severity {analysis.severity}/5 — {SEVERITY_LABELS[analysis.severity]}
                  </span>
                )}
              </div>
              {analysis.description && (
                <p className="text-slate-400">{analysis.description}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-yellow-400">No road defect detected</p>
              {analysis.description && (
                <p className="text-slate-400">{analysis.description}</p>
              )}
            </div>
          )}
        </div>
      )}

      {analysisError && !analyzing && (
        <p className="mt-2 text-xs text-slate-500">{analysisError}</p>
      )}

      <button
        onClick={submitReport}
        disabled={!pos || submitting || analyzing}
        className="mt-4 w-full rounded-2xl bg-white px-4 py-4 font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Report"}
      </button>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
    </div>
    </div>
    </div>
  );
};

export default ReportPage;
