import mongoose from "mongoose";

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
    photo: {
  data: String,
  mimeType: String,
  originalName: String,
  size: Number,
},
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
