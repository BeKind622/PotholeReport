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
    ipAddress: { type: String, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number }, // metres
      city: String,
      region: String,
      country: String,
      timezone: String,
      isp: String,
    },
    source: { type: String, default: "ip" }, // "ip" or "gps" later
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

// 2) Routes
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/reports", async (req, res) => {
  try {
    const { ipAddress, location, source } = req.body;

    if (!ipAddress) return res.status(400).json({ error: "ipAddress is required" });
    if (!location?.latitude || !location?.longitude) {
      return res.status(400).json({ error: "location.latitude and location.longitude are required" });
    }

    const saved = await Report.create({ ipAddress, location, source });
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error saving report" });
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
