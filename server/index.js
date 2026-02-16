import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); 
app.use(express.json());

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
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);


// 2) Routes
app.post("/api/reports", async (req, res) => {
  try {
    const ipAddress = req.ip;
    const { location, source } = req.body;

    if (!location?.latitude || !location?.longitude) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const saved = await Report.create({
      ipAddress,
      location,
      source: source || "gps",
    });

    // 🔥 THIS LINE IS CRITICAL
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
