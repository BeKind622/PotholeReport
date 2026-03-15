import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const ReportPage = () => {
  const [pos, setPos] = useState(null);
  const [address, setAddress] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

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
  `${API_BASE}/api/reports/reverse-geocode?lat=${latitude}&lng=${longitude}`
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

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    console.log("Submitting to:", `${API_BASE}/api/reports`);

    const res = await fetch(`${API_BASE}/api/reports`, {
      method: "POST",
      body: formData,
    });

    const text = await res.text();
    console.log("Submit response:", res.status, text);

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
          className="mt-4 w-full max-w-xs rounded-xl border border-slate-700"
        />
      )}

      <button
        onClick={submitReport}
        disabled={!pos || submitting}
        className="mt-4 w-full rounded-2xl bg-white px-4 py-4 font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Report"}
      </button>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
    </div>
  );
};

export default ReportPage;