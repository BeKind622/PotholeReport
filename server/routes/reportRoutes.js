import express from "express";
import Report from "../models/Report.js";
import { reverseGeocodeNominatim } from "../services/geocodingService.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const ipAddress = req.ip;

    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const accuracy = Number(req.body.accuracy);
    const timestamp = req.body.timestamp;
    const source = req.body.source || "gps";

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "latitude and longitude are required" });
    }

    let nominatimData = null;
    try {
      nominatimData = await reverseGeocodeNominatim(latitude, longitude);
    } catch (e) {
      console.warn("Reverse geocode failed:", e.message);
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
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const data = await reverseGeocodeNominatim(lat, lng);

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