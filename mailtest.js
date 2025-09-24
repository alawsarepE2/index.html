const nodemailer = require("nodemailer");

// 🔑 Replace with your Gmail + App Password
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",   // Gmail SMTP
  port: 465,                // SSL port
  secure: true,             // true for port 465
  auth: {
    user: "jeyceesirc@gmail.com",       // your Gmail
    pass: "kydd niak mont wdjo",        // <-- your App Password (no spaces)
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certs (dev only)
  },
});

// ✅ Test sending email
async function sendTestMail() {
  try {
    const info = await transporter.sendMail({
      from: '"Smart School Clinic" <jeyceesirc@gmail.com>',
      to: "jeyceesirc@gmail.com",  // <-- replace with your own test email
      subject: "Test Email from Clinic App ✅",
      text: "Hello! This is a test email from your Node.js Smart School Clinic app.",
    });

    console.log("✅ Email sent successfully! Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Email send error:", err);
  }
}

// Run test
sendTestMail();
