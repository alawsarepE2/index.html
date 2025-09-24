const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ===================
// Student Register
// ===================
router.post("/register", async (req, res) => {
  try {
    const { studentId, name, email, password, course } = req.body;

    if (!studentId || !name || !email || !password || !course) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (existing) {
      return res.status(400).json({ error: "Student already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const student = new Student({
      studentId,
      name,
      email: email.toLowerCase(),
      password: hashed,
      course,
    });

    await student.save();
    res.status(201).json({ message: "Student registered successfully", student });
  } catch (err) {
    console.error("Student register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================
// Student Login
// ===================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: "student",
        email: student.email,
        studentId: student.studentId, // ✅ include public-facing ID
      },
      JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        email: student.email,
        name: student.name,
        course: student.course,
      },
    });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
