import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors({ origin: /^http:\/\/localhost:\d+$/, credentials: true })); // replace localhost with specific ID for security ("http://localhost:5173")
app.use(cookieParser());


// later added auth middleware, admin routes
function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Not authenticated" });
  }
}

// Login: sets cookie
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });

  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production HTTPS
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.json({ ok: true });
});

// Logout: clears cookie
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ ok: true });
});

// Check session
app.get("/api/admin/me", (req, res) => {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ ok: false });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ ok: false });
  }
});
// admin only endpoint to view reports
app.get("/api/admin/reports", requireAdmin, async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 }).limit(200);
  res.json(reports);
});


// 1) Schema / Model
const reportSchema = new mongoose.Schema(
  {
    ipAddress: { type: String },
    source: { type: String, default: "gps" },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number },
      timestamp: { type: String },
    },
    address: {
      displayName: { type: String }, // full readable address
      road: String,
      houseNumber: String,
      postcode: String,
      city: String,
      town: String,
      village: String,
      county: String,
      state: String,
      country: String,
      countryCode: String,
    },
      // API response from Nominatim (OpenStreetMap) for reverse geocoding
    nominatim: {
      placeId: Number,
      osmType: String,
      osmId: Number,
      lat: String,
      lon: String,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

// helper nominatim function
async function reverseGeocodeNominatim(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?format=jsonv2&lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lon)}` +
    `&zoom=18&addressdetails=1`;

  const r = await fetch(url, {
    headers: {
      "User-Agent": process.env.NOMINATIM_USER_AGENT || "PotholeReporter/1.0",
      "Accept-Language": "en",
    },
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Nominatim failed (${r.status}): ${text}`);
  }

  return r.json();
}

// 2) Routes
app.post("/api/reports", async (req, res) => {
  try {
    const ipAddress = req.ip; // best practice
    const { location, source } = req.body;

    if (!location?.latitude || !location?.longitude) {
      return res.status(400).json({ error: "location.latitude and location.longitude are required" });
    }

    // 1) Reverse geocode
    let nominatimData = null;
    try {
      nominatimData = await reverseGeocodeNominatim(location.latitude, location.longitude);
    } catch (e) {
      // Don’t block saving if address lookup fails
      console.warn("Reverse geocode failed:", e.message);
    }

    // 2) Map nominatim -> address fields
    const addr = nominatimData?.address || {};

    const doc = {
      ipAddress,
      source: source || "gps",
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
      },
      address: nominatimData
        ? {
            displayName: nominatimData.display_name,
            road: addr.road,
            houseNumber: addr.house_number,
            postcode: addr.postcode,
            city: addr.city,
            town: addr.town,
            village: addr.village,
            county: addr.county,
            state: addr.state,
            country: addr.country,
            countryCode: addr.country_code,
          }
        : undefined,
      nominatim: nominatimData
        ? {
            placeId: nominatimData.place_id,
            osmType: nominatimData.osm_type,
            osmId: nominatimData.osm_id,
            lat: nominatimData.lat,
            lon: nominatimData.lon,
          }
        : undefined,
    };

    // 3) Save to MongoDB
    const saved = await Report.create(doc);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save report" });
  }
});


// 3) Connect + start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

  // Nominatim geocaching api

  app.get("/api/reverse-geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`;

    const r = await fetch(url, {
      headers: {
        // Nominatim asks for a valid User-Agent / contact
        "User-Agent": "PotholeReporter/1.0 (contact: youremail@example.com)",
        "Accept-Language": "en",
      },
    });

    if (!r.ok) return res.status(502).json({ error: "Reverse geocoding failed" });

    const data = await r.json();
    res.json({
      displayName: data.display_name,
      address: data.address, // includes road, suburb, city, postcode, etc.
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});
