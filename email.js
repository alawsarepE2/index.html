const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// POST /api/email/send
router.post("/send", async (req, res) => {
  const { studentEmail, studentName, reason } = req.body;

  if (!studentEmail || !studentName || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yourclinicemail@gmail.com",
        pass: "your-app-password" // Use App Password if 2FA is enabled
      }
    });

    // Email content
    const mailOptions = {
      from: "Smart School Clinic <yourclinicemail@gmail.com>",
      to: studentEmail,
      subject: "Your Medical Certificate",
      html: `
        <p>Dear ${studentName},</p>
        <p>This is to certify that you were examined at Smart School Clinic.</p>
        <p><strong>Findings:</strong> ${reason}</p>
        <p>Please find your certificate attached.</p>
        <p>Regards,<br>Smart School Clinic</p>
      `,
      attachments: [
        {
          filename: "medical-certificate.pdf",
          path: path.join(__dirname, "../uploads/certificates/medical-certificate.pdf")
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
