import { useState } from "react";

export default function App() {
  const [pos, setPos] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReport = async ({ ipAddress, geoInfo }) => {
    const payload = {
      ipAddress,
      source: "gps",
      location: {
        latitude: geoInfo.latitude,
        longitude: geoInfo.longitude,
        accuracy: geoInfo.accuracy,
        city: geoInfo.city,
        region: geoInfo.region,
        country: geoInfo.country_name,
        timezone: geoInfo.timezone,
        isp: geoInfo.org,
        timestamp: geoInfo.timestamp,
      },
    };

    const res = await fetch("http://localhost:5000/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit report");
    }

    return res.json();
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

          // 🔥 SEND TO MONGODB
          await submitReport({
            ipAddress: "auto", // later: derive on server using req.ip
            geoInfo: geoData,
          });
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
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };
  return (
    <div className="App">
      <button onClick={getGpsLocation} disabled={loading}>
        {loading ? "Getting GPS..." : "Report pothole (1 tap)"}
      </button>

      {error && <p>{error}</p>}

      {pos && (
        <div>
          <p>Lat: {pos.latitude}</p>
          <p>Lng: {pos.longitude}</p>
          <p>Accuracy: {Math.round(pos.accuracy)} m</p>
          <p>Time: {pos.timestamp}</p>
        </div>
      )}
    </div>
  );
}