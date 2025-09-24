const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const auth = require("../middleware/authMiddleware");

// ===============================
// 🛠 Create Announcement (Admin)
// ===============================
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { title, content, targetRole } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const announcement = new Announcement({
      title,
      content,
      targetRole: targetRole || "all", // Optional targeting
      createdBy: req.user.email || "admin"
    });

    await announcement.save();
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    console.error("❌ Create announcement error:", err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// ===============================
// 📥 View Announcements by Role
// ===============================
router.get("/", auth(["admin", "student"]), async (req, res) => {
  try {
    const announcements = await Announcement.find({
      $or: [{ targetRole: "student" }, { targetRole: "all" }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (err) {
    console.error("❌ Fetch student/admin announcements error:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.get("/staff", auth(["staff"]), async (req, res) => {
  try {
    const announcements = await Announcement.find({
      $or: [{ targetRole: "staff" }, { targetRole: "all" }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (err) {
    console.error("❌ Staff fetch error:", err);
    res.status(500).json({ error: "Failed to fetch staff announcements" });
  }
});

router.get("/faculty", auth(["faculty"]), async (req, res) => {
  try {
    const announcements = await Announcement.find({
      $or: [{ targetRole: "faculty" }, { targetRole: "all" }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (err) {
    console.error("❌ Faculty fetch error:", err);
    res.status(500).json({ error: "Failed to fetch faculty announcements" });
  }
});

// ===============================
// 🗑 Delete Announcement (Admin)
// ===============================
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

module.exports = router;
