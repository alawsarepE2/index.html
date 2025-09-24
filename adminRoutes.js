// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Student = require("../models/Student");
const Appointment = require("../models/Appointment");
const Certificate = require("../models/Certificate");

// protected: admin only
router.get("/stats", auth(["admin"]), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: "active" });
    const pendingAppointments = await Appointment.countDocuments({ status: "pending" });
    res.json({ totalStudents, activeStudents, pendingAppointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/student/:studentId", auth(["student"]), async (req, res) => {
  const { studentId } = req.params;

  if (!studentId || typeof studentId !== "string") {
    console.warn("⚠️ Invalid studentId received:", studentId);
    return res.status(400).json({ error: "Invalid or missing studentId" });
  }

  try {
    const certs = await Certificate.find({ studentId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: certs });
  } catch (err) {
    console.error("❌ Fetch student certificates error:", err.message);
    res.status(500).json({ error: "Failed to fetch student certificates" });
  }
});

router.get("/appointments", auth(["admin"]), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("studentId", "studentId firstName lastName email")
      .populate("facultyId", "username email")
      .populate("staffId", "username email")
      .lean();

    const formatted = appointments.map(a => {
      let role = "Unknown";
      let name = "N/A";
      let email = "N/A";
      let id = "N/A";

      if (a.studentId) {
        role = "Student";
        name = `${a.studentId.firstName} ${a.studentId.lastName}`.trim();
        email = a.studentId.email;
        id = a.studentId.studentId;
      } else if (a.facultyId) {
        role = "Faculty";
        name = a.facultyId.username;
        email = a.facultyId.email;
        id = a.facultyId._id;
      } else if (a.staffId) {
        role = "Staff";
        name = a.staffId.username;
        email = a.staffId.email;
        id = a.staffId._id;
      }

      return {
        id: a._id,
        role,
        name,
        userId: id,
        email,
        reason: a.reason || "N/A",
        date: a.date || null,
        time: a.time || "N/A",
        status: a.status || "Pending"
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Failed to fetch appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
module.exports = router;
