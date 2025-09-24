// routes/appointments.js
const express = require("express");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/auth");
const Announcement = require("../models/Announcement"); // Make sure this is imported

const router = express.Router();

/**
 * ===============================
 * STUDENT ROUTES
 * ===============================
 */

// Student: Create appointment
router.post("/", auth(["student"]), async (req, res) => {
  try {
    const { date, time, reason, name } = req.body;
    if (!date || !time || !reason || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const appointment = new Appointment({
      studentId: req.user.studentId,
      name,
      date,
      time,
      reason,
      status: "Pending",
    });

    await appointment.save();
    res.json({ success: true, message: "Appointment created successfully", appointment });
  } catch (err) {
    console.error("❌ Error creating student appointment:", err);
    res.status(500).json({ error: "Server error creating appointment" });
  }
});

// Student: View own appointments
router.get("/", auth(["student"]), async (req, res) => {
  try {
    const appointments = await Appointment.find({ studentId: req.user.studentId }).lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("❌ Error fetching student appointments:", err);
    res.status(500).json({ error: "Server error fetching appointments" });
  }
});

/**
 * ===============================
 * FACULTY ROUTES
 * ===============================
 */

// Faculty: Create appointment
router.post("/create", auth(["faculty"]), async (req, res) => {
  try {
    const { date, time, reason, name } = req.body;
    if (!date || !time || !reason || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const appointment = new Appointment({
      facultyId: req.user._id,
      name,
      date,
      time,
      reason,
      status: "Pending",
    });

    await appointment.save();
    res.json({ success: true, message: "Faculty appointment created successfully", appointment });
  } catch (err) {
    console.error("❌ Error creating faculty appointment:", err);
    res.status(500).json({ error: "Server error creating appointment" });
  }
});

// Faculty: View own appointments
router.get("/faculty/:id", auth(["faculty"]), async (req, res) => {
  try {
    const facultyId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }

    const appointments = await Appointment.find({ facultyId }).lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("❌ Faculty appointment error:", err);
    res.status(500).json({ error: "Failed to load faculty appointments" });
  }
});
// Faculty announcements

router.get("/faculty", auth(["faculty"]), async (req, res) => {
  try {
    const announcements = await Announcement.find({ target: "faculty" }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, announcements });
  } catch (err) {
    console.error("❌ Faculty announcement error:", err);
    res.status(500).json({ error: "Failed to load faculty announcements" });
  }
});


/**
 * ===============================
 * STAFF ROUTES
 * ===============================
 */

// Staff: Create appointment
router.post("/create-staff", auth(["staff"]), async (req, res) => {
  try {
    const { date, time, reason, name } = req.body;
    if (!date || !time || !reason || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const appointment = new Appointment({
      staffId: req.user._id,
      name,
      date,
      time,
      reason,
      status: "Pending",
    });

    await appointment.save();
    res.json({ success: true, message: "Staff appointment created successfully", appointment });
  } catch (err) {
    console.error("❌ Error creating staff appointment:", err);
    res.status(500).json({ error: "Server error creating appointment" });
  }
});

// Staff: View own appointments
router.get("/staff/:id", auth(["staff"]), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid staff ID" });
    }

    const appointments = await Appointment.find({ staffId: id }).lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("❌ Error fetching staff appointments:", err);
    res.status(500).json({ error: "Server error fetching appointments" });
  }
});

/**
 * ===============================
 * ADMIN ROUTES
 * ===============================
 */

// Admin: View all appointments
// Admin: Update appointment status
router.patch("/:id", auth(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ success: true, message: "Appointment status updated", appointment: updated });
  } catch (err) {
    console.error("❌ Error updating appointment status:", err);
    res.status(500).json({ error: "Server error updating appointment" });
  }
});
// Admin: Delete appointment
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ success: true, message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting appointment:", err);
    res.status(500).json({ error: "Server error deleting appointment" });
  }
});


router.get("/all", auth(["admin"]), async (req, res) => {
  try {
    const appointments = await Appointment.find().lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("❌ Error fetching all appointments:", err);
    res.status(500).json({ error: "Server error fetching appointments" });
  }
});

module.exports = router;
