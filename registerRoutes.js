// backend/routes/registerRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// wrapper to create student (same as student register)
router.post("/", async (req, res) => {
  try {
    const { studentId, firstName, lastName, email, password } = req.body;
    if (!studentId || !email || !password || !firstName) return res.status(400).json({ error: "Missing" });
    const exists = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (exists) return res.status(400).json({ error: "Already registered" });

    const s = new Student({ studentId, firstName, lastName, email, password });
    await s.save();
    res.status(201).json({ message: "Registered", studentId: s._id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
