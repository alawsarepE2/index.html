// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const auth = require("../middleware/authMiddleware");

// get own profile
router.get("/", auth(), async (req, res) => {
  try {
    const user = await Student.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// update own profile
router.put("/", auth(), async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.user.id, req.body, { new: true }).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
