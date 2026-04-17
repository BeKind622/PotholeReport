import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://oppressive-statistically-randi.ngrok-free.dev",
      "https://potholereport.onrender.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
