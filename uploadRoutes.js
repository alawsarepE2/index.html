// backend/routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads/files");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// upload general file (admins)
router.post("/", auth(["admin"]), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "Uploaded", fileName: req.file.filename, originalName: req.file.originalname });
});

module.exports = router;
