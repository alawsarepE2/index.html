const express = require("express");
const router = express.Router();
const HealthRecord = require("../models/HealthRecord");
const auth = require("../middleware/authMiddleware");

// ✅ Create Health Record
router.post("/", auth(["admin", "student"]), async (req, res) => {
  try {
    const { studentId, name, diagnosis, treatment, date } = req.body;

    if (!studentId || !diagnosis || !treatment || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const record = new HealthRecord({ studentId, name, diagnosis, treatment, date });
    await record.save();

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error("❌ Create error:", err.stack);
    res.status(500).json({ error: "Failed to create record" });
  }
});

// ✅ Get Health Records
router.get("/", auth(["admin", "student"]), async (req, res) => {
  try {
    const records =
      req.user.role === "admin"
        ? await HealthRecord.find()
        : await HealthRecord.find({ studentId: req.user.studentId });

    res.json({ success: true, data: records });
  } catch (err) {
    console.error("❌ Fetch error:", err.stack);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

module.exports = router;
