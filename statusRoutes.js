const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/authMiddleware");

// ✅ Model imports
const Certificate = require("../models/Certificate");
const Status = require("../models/Status");
const Announcement = require("../models/Announcement");

//
// ===============================
// 📄 STAFF ROUTES
// ===============================
//

// Staff: Certificates
router.get("/staff/certificates", auth(["staff"]), async (req, res) => {
  try {
    const staffId = req.user._id;
    const certs = await Certificate.find({ staffId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, certificates: certs });
  } catch (err) {
    console.error("❌ Staff certificate error:", err);
    res.status(500).json({ error: "Failed to load staff certificates" });
  }
});

// Staff: Status
router.get("/staff/status", auth(["staff"]), async (req, res) => {
  try {
    const staffId = req.user._id;
    const status = await Status.findOne({ staffId }).lean();
    res.json({ success: true, status: status?.value || "Active" });
  } catch (err) {
    console.error("❌ Staff status error:", err);
    res.status(500).json({ error: "Failed to load staff status" });
  }
});

// Staff: Announcements
router.get("/staff/announcements", auth(["staff"]), async (req, res) => {
  try {
    const announcements = await Announcement.find({ target: "staff" }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, announcements });
  } catch (err) {
    console.error("❌ Staff announcement error:", err);
    res.status(500).json({ error: "Failed to load staff announcements" });
  }
});


//
// ===============================
// 📄 FACULTY ROUTES
// ===============================
//

// Faculty: Certificates
router.get("/faculty/certificates", auth(["faculty"]), async (req, res) => {
  try {
    const facultyId = req.user._id;
    const certs = await Certificate.find({ facultyId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, certificates: certs });
  } catch (err) {
    console.error("❌ Faculty certificate error:", err);
    res.status(500).json({ error: "Failed to load faculty certificates" });
  }
});

// Faculty: Status (GET)
router.get("/announcements", auth(["faculty"]), async (req, res) => {
  try {
    const announcements = await Announcement.find({ target: "faculty" }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, announcements });
  } catch (err) {
    console.error("❌ Faculty announcement error:", err);
    res.status(500).json({ error: "Failed to load faculty announcements" });
  }
});

// 🔔 Faculty Status
router.get("/status", auth(["faculty"]), async (req, res) => {
  try {
    const facultyId = req.user._id;
    const status = await Status.findOne({ facultyId });
    if (!status) return res.status(404).json({ error: "No status found for this faculty." });
    res.json({ success: true, status: status.value });
  } catch (err) {
    console.error("❌ Error fetching faculty status:", err);
    res.status(500).json({ error: "Server error fetching status." });
  }
});

router.put("/status", auth(["faculty"]), async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { value } = req.body;
    if (!value) return res.status(400).json({ error: "Status value is required." });

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

// 📄 Faculty Certificates

module.exports = router;
