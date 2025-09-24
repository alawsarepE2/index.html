// routes/staffRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/authMiddleware");

// ✅ Model imports
const Appointment = require("../models/Appointment");
const Certificate = require("../models/Certificate");
const Status = require("../models/Status");
const Announcement = require("../models/Announcement");

// ===============================
// 📄 Staff Certificates
// ===============================
router.get("/certificates/:id", auth(["staff"]), async (req, res) => {
  try {
    const staffId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ error: "Invalid staff ID" });
    }

    const certs = await Certificate.find({ staffId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, certificates: certs });
  } catch (err) {
    console.error("❌ Staff certificate error:", err);
    res.status(500).json({ error: "Failed to load staff certificates" });
  }
});

// ===============================
// 🔔 Staff Status
// ===============================
router.get("/status/:id", auth(["staff"]), async (req, res) => {
  try {
    const staffId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ error: "Invalid staff ID" });
    }

    const status = await Status.findOne({ staffId }).lean();
    res.json({ success: true, status: status?.value || "Active" });
  } catch (err) {
    console.error("❌ Staff status error:", err);
    res.status(500).json({ error: "Failed to load staff status" });
  }
});

// ===============================
// 📢 Staff Announcements
// ===============================
router.get("/announcements", auth(["staff"]), async (req, res) => {
  try {
    const announcements = await Announcement.find({ target: "staff" }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, announcements });
  } catch (err) {
    console.error("❌ Staff announcement error:", err);
    res.status(500).json({ error: "Failed to load staff announcements" });
  }
});

// ===============================
// 📅 Create Appointment (Staff)
// ===============================
router.post("/appointments/create", auth(["staff"]), async (req, res) => {
  try {
    const { studentId, name, date, time, reason } = req.body;

    if (!studentId || !name || !date || !time || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const appointment = new Appointment({
      studentId,
      name,
      date,
      time,
      reason,
      status: "Pending",
      staffId: req.user._id // ✅ link to logged-in staff
    });

    await appointment.save();
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    console.error("❌ Staff appointment creation error:", err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// ===============================
// ✅ Update Appointment Status (Staff)
// ===============================
router.patch("/appointments/status/:id", auth(["staff"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // ✅ Only assigned staff can update
    if (appointment.staffId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this appointment" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, message: "Status updated", data: appointment });
  } catch (err) {
    console.error("❌ Staff appointment status update error:", err);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

module.exports = router;
