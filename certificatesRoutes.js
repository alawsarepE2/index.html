const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Certificate = require("../models/Certificate");
const auth = require("../middleware/authMiddleware");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

// ================================
// Ensure upload directory exists
// ================================
const uploadDir = path.join(__dirname, "../uploads/certificates");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ================================
// Multer configuration
// ================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/**
 * @route POST /api/certificates
 * @desc Admin uploads an existing certificate file
 */
router.post("/", auth(["admin"]), upload.single("certificate"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });

    const { studentId, studentName, nurseName, reason } = req.body;
    if (!studentId || !studentName || !nurseName || !reason) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const cert = new Certificate({
      studentId,
      studentName,
      nurseName,
      reason,
      fileName: req.file.filename,
      filePath: `/uploads/certificates/${req.file.filename}`,
    });

    await cert.save();
    res.status(201).json({ success: true, data: cert });
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

/**
 * @route GET /api/certificates
 * @desc Admin fetches all certificates
 */
router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const certs = await Certificate.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: certs.map((c) => ({
        studentId: c.studentId,
        studentName: c.studentName,
        nurseName: c.nurseName,
        reason: c.reason,
        fileName: c.fileName,
        url: c.filePath,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    console.error("❌ Fetch certificates error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch certificates" });
  }
});

/**
 * @route GET /api/certificates/student/:studentId
 * @desc Student fetches their own certificates
 */
// GET certificates for the logged-in student
router.get("/student", auth(["student"]), async (req, res) => {
  try {
    const studentId = req.user.studentId; // ✅ use JWT value
    if (!studentId) {
      return res.status(400).json({ success: false, error: "Missing student ID in token" });
    }

    const certs = await Certificate.find({ studentId }).sort({ createdAt: -1 });
    res.json({ success: true, data: certs });
  } catch (err) {
    console.error("❌ Fetch student certificates error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch student certificates" });
  }
});
router.get("/staff/:id", auth(["staff"]), async (req, res) => {
  try {
    const { id } = req.params;
    const certs = await Certificate.find({ staffId: id }).sort({ createdAt: -1 });
    res.json({ success: true, certificates: certs });
  } catch (err) {
    console.error("❌ Staff certificate fetch error:", err);
    res.status(500).json({ error: "Failed to fetch staff certificates" });
  }
});

// GET certificates for a specific faculty member
router.get("/faculty/:id", auth(["faculty"]), async (req, res) => {
  try {
    const { id } = req.params;
    const certs = await Certificate.find({ facultyId: id }).sort({ createdAt: -1 });
    res.json({ success: true, certificates: certs });
  } catch (err) {
    console.error("❌ Faculty certificate fetch error:", err);
    res.status(500).json({ error: "Failed to fetch faculty certificates" });
  }
});
/**
 * @route POST /api/certificates/generate
 * @desc Admin generates a medical certificate (PDF + Email)
 */
router.post("/generate", auth(["admin"]), async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, consultationDate, diagnosis, nurseName } = req.body;

    if (!studentId || !studentName || !studentEmail || !consultationDate || !diagnosis || !nurseName) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const reason = diagnosis;
    const fileName = `${Date.now()}-${studentId}-certificate.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // PDF creation
    const doc = new PDFDocument({ margin: 50 });
    const pdfStream = fs.createWriteStream(filePath);

    doc.pipe(pdfStream);

    // Header + Logo
    const logoPath = path.join(__dirname, "logo.jpeg");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 60, 50, { width: 70 });
    }
    doc.font("Times-Bold").fontSize(12).text("Republic of the Philippines", { align: "center" });
    doc.fontSize(14).text("SOUTHERN LUZON STATE UNIVERSITY", { align: "center" });
    doc.fontSize(12).font("Times-Roman").text("Lucena City, Quezon", { align: "center" });
    doc.moveDown(1);
    doc.font("Times-Bold").fontSize(14).text("UNIVERSITY HEALTH SERVICES (SMSC)", { align: "center" });
    doc.font("Times-Roman").fontSize(12).text("MEDICAL CERTIFICATE", { align: "center", underline: true });

    doc.moveDown(2);
    doc.font("Times-Roman").text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
    doc.moveDown(2);

    doc.fontSize(12).text("To Whom It May Concern:", { align: "left" });
    doc.moveDown();
    doc.text(
      `This is to certify that Mr./Ms. ${studentName} consulted our school clinic on ${consultationDate}. ` +
      `He/She was examined and diagnosed with ${diagnosis}, and therefore unfit to attend his/her classes.`,
      { align: "justify" }
    );
    doc.moveDown(2);
    doc.text("Issued upon request of the above-named student for the purpose of excuse from his/her missed classes.", { align: "justify" });
    doc.moveDown(6);

    doc.text("_________________________", 70, 500);
    doc.fontSize(11).text(`Noted by:\n${nurseName}`, 70, 515);
    doc.text("_________________________", 350, 500);
    doc.fontSize(11).text("Dara Danica M. Dañez, M.D.\nLicense No. 0156014\nUniversity Part-time Physician", 350, 515);

    doc.fontSize(9).text("AFA-UHS-1.02F11", 70, 730);
    doc.fontSize(9).text("Page 1 of 1", { align: "right" });

    doc.end();

    // When PDF writing is done → save DB & send email
    pdfStream.on("finish", async () => {
      try {
        const cert = new Certificate({
          studentId,
          studentName,
          nurseName,
          consultationDate,
          diagnosis,
          reason,
          fileName,
          filePath: `/uploads/certificates/${fileName}`,
        });
        await cert.save();

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "jeyceesirc@gmail.com",
            pass: "kydd niak mont wdjo", // Gmail App Password
          },
          tls: {
            rejectUnauthorized: false,
            minVersion: "TLSv1.2",
          },
        });

        await transporter.sendMail({
          from: "Smart School Clinic <jeyceesirc@gmail.com>",
          to: studentEmail,
          subject: "Your Medical Certificate",
          html: `
            <p>Dear ${studentName},</p>
            <p>This is to certify that you were examined at Smart School Clinic on <b>${consultationDate}</b>.</p>
            <p><strong>Diagnosis:</strong> ${diagnosis}</p>
            <p>Issued by Nurse ${nurseName}</p>
            <p>Regards,<br>Smart School Clinic</p>
          `,
          attachments: [{ filename: "medical-certificate.pdf", path: filePath }],
        });

        res.status(201).json({ success: true, message: "Certificate generated & emailed", data: cert });
      } catch (err) {
        console.error("❌ Email/DB save error:", err.message);
        res.status(500).json({ success: false, error: "Failed to complete certificate process" });
      }
    });
  } catch (err) {
    console.error("❌ Certificate generation error:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate certificate" });
  }
});

module.exports = router;
