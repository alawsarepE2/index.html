const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const auth = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// GET reports aggregated by period
router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const { type } = req.query; // daily, weekly, monthly, yearly
    if (!type) return res.status(400).json({ error: "Type required" });

    let startDate;
    const today = new Date();

    switch(type) {
      case "weekly":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return res.status(400).json({ error: "Invalid type" });
    }

    const appointments = await Appointment.find({ date: { $gte: startDate } }).lean();

    if (!appointments.length) return res.json({ records: [], count: 0 });

    // Count reasons
    const reasonCount = {};
    appointments.forEach(a => {
      const reason = a.reason || "Unknown";
      reasonCount[reason] = (reasonCount[reason] || 0) + 1;
    });

    // Sort reasons by frequency
    const sortedReasons = Object.entries(reasonCount)
      .sort((a, b) => b[1] - a[1]);

    res.json({
      records: appointments,
      count: appointments.length,
      mostCommonReason: sortedReasons[0] ? sortedReasons[0][0] : "N/A",
      reasonStats: sortedReasons.map(([reason, count]) => ({ reason, count }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
