// backend/routes/verifyTokenRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
});

module.exports = router;
