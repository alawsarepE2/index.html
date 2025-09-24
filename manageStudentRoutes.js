// backend/routes/manageStudentRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const auth = require("../middleware/authMiddleware");

// list students (admin)
router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// get student
router.get("/:id", auth(["admin"]), async (req, res) => {
  try {
    const s = await Student.findById(req.params.id).select("-password");
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// create student (admin)
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { studentId, firstName, lastName, email, password } = req.body;
    const exist = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (exist) return res.status(400).json({ error: "Already exists" });
    const s = new Student({ studentId, firstName, lastName, email, password });
    await s.save();
    res.status(201).json(s);
  } catch (err) {
    res.status(500).json({ error: "Failed to create student" });
  }
});

// update and delete
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update" });
  }
});

router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;
