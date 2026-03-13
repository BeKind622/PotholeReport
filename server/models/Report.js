import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    ipAddress: { type: String },
    photo: {
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  path: String,
},
    source: { type: String, default: "gps" },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number },
      timestamp: { type: String },
    },
    address: {
      displayName: String,
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

export default mongoose.model("Report", reportSchema);
