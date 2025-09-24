// routes/students.js
const express = require("express");
const Student = require("../models/Student");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET all students
router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.json({ success: true, data: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// CREATE student
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { id, name, email, contact } = req.body;
    const student = new Student({ studentId: id, name, email, contact });
    await student.save();
    res.json({ success: true, data: student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create student" });
  }
});

// UPDATE student
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, contact } = req.body;
    const student = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      { name, email, contact },
      { new: true }
    );
    res.json({ success: true, data: student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// DELETE student
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    await Student.findOneAndDelete({ studentId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;
