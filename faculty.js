const express = require("express");
const router = express.Router();
const Status = require("../models/Status");
const auth = require("../middleware/auth");
const Announcement = require("../models/Announcement"); // ✅ Add this at the top if missing

// GET /api/faculty/status → Get faculty's current status
router.get("/status", auth(["faculty"]), async (req, res) => {
  try {
    const facultyId = req.user._id;
    const status = await Status.findOne({ facultyId });

    if (!status) {
      return res.status(404).json({ error: "No status found for this faculty." });
    }

    res.json({ success: true, status: status.value });
  } catch (err) {
    console.error("❌ Error fetching faculty status:", err);
    res.status(500).json({ error: "Server error fetching status." });
  }
});

// PUT /api/faculty/status → Update faculty's status
router.put("/status", auth(["faculty"]), async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ error: "Status value is required." });
    }

    const updated = await Status.findOneAndUpdate(
      { facultyId },
      { value },
      { new: true, upsert: true }
    );

    res.json({ success: true, status: updated.value });
  } catch (err) {
    console.error("❌ Error updating faculty status:", err);
    res.status(500).json({ error: "Server error updating status." });
  }
});
router.get("/announcements", auth(["faculty"]), async (req, res) => {
  try {
    const announcements = await Announcement.find({ target: "faculty" }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, announcements });
  } catch (err) {
    console.error("❌ Error fetching faculty announcements:", err);
    res.status(500).json({ error: "Server error fetching announcements." });
  }
});

module.exports = router;
