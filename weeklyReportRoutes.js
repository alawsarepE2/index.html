// backend/routes/weeklyReportRoutes.js
const express = require("express");
const router = express.Router();
const WeeklyReport = require("../models/WeeklyReport");
const auth = require("../middleware/authMiddleware");

router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const list = await WeeklyReport.find().sort({ weekStart: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weekly reports" });
  }
});

router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { weekStart, weekEnd, summary } = req.body;
    const wr = new WeeklyReport({ weekStart, weekEnd, summary });
    await wr.save();
    res.status(201).json(wr);
  } catch (err) {
    res.status(500).json({ error: "Failed to create" });
  }
});

module.exports = router;
