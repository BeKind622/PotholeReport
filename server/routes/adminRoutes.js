import express from "express";
import jwt from "jsonwebtoken";
import Report from "../models/Report.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ ok: false });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ ok: false });
  }
});

router.get("/reports", requireAdmin, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(200);
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

router.delete("/reports/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Report.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
