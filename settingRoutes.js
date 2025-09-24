// backend/routes/settingRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

// simple settings endpoint
router.get("/", auth(["admin"]), (req, res) => {
  res.json({ settings: { siteName: "Smart School Clinic" } });
});

router.put("/", auth(["admin"]), (req, res) => {
  // save settings to DB or file (not implemented)
  res.json({ message: "Settings updated", settings: req.body });
});

module.exports = router;
