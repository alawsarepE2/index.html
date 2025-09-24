// backend/routes/recordRoutes.js
const express = require("express");
const router = express.Router();
const HealthRecord = require("../models/HealthRecord");
const auth = require("../middleware/authMiddleware");

// (same as healthRecordRoutes but kept for compatibility)
router.get("/", auth(), async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const all = await HealthRecord.find().populate("studentId", "studentId firstName lastName");
      return res.json(all);
    }
    const list = await HealthRecord.find({ studentId: req.user.id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

module.exports = router;
