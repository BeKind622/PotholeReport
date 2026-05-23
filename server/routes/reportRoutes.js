import express from "express";
import Report from "../models/Report.js";
import { reverseGeocodeNominatim } from "../services/geocodingService.js";
import { analyzeRoadPhoto } from "../services/aiAnalysis.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/analyze-photo", upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No photo provided" });

  try {
    const base64 = req.file.buffer.toString("base64");
    const analysis = await analyzeRoadPhoto(base64, req.file.mimetype);
    res.json(analysis);
  } catch (err) {
    console.error("AI analysis error:", err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const ipAddress = req.ip;

    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const accuracy = Number(req.body.accuracy);
    const timestamp = req.body.timestamp;
    const source = req.body.source || "gps";

    if (isNaN(latitude) || isNaN(longitude)) {
      return res
        .status(400)
        .json({ error: "latitude and longitude are required" });
    }

    let nominatimData = null;
    try {
      nominatimData = await reverseGeocodeNominatim(latitude, longitude);
    } catch (error) {
      console.warn("Nominatim failed:", error.message);
    }

    const addr = nominatimData?.address || {};

    const photoData = req.file
      ? {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
          size: req.file.size,
        }
      : undefined;

    let aiAnalysis;
    if (req.body.aiAnalysis) {
      try {
        const parsed = JSON.parse(req.body.aiAnalysis);
        aiAnalysis = { ...parsed, analyzedAt: new Date() };
      } catch {
        // ignore malformed analysis
      }
    }

    const doc = {
      ipAddress,
      source,
      location: {
        latitude,
        longitude,
        accuracy,
        timestamp,
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
      photo: photoData,
      nominatim: nominatimData
        ? {
            placeId: nominatimData.place_id,
            osmType: nominatimData.osm_type,
            osmId: nominatimData.osm_id,
            lat: nominatimData.lat,
            lon: nominatimData.lon,
          }
        : undefined,
      aiAnalysis,
    };

    const saved = await Report.create(doc);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save report" });
  }
});

router.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon required" });
    }

    const data = await reverseGeocodeNominatim(lat, lon);

    if (!data) {
      return res.status(200).json({
        displayName: "Address unavailable",
        address: {}
      });
    }

    res.json({
      displayName: data.display_name,
      address: data.address,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
