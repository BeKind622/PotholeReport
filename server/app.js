import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://oppressive-statistically-randi.ngrok-free.dev",
      "https://potholereport.onrender.com",
      "https://taupe-kleicha-d31025.netlify.app",
      "https://potholereportapp.netlify.app",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);

export default app;
