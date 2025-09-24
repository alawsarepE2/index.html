// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const clientPath = path.join(__dirname, "../frontend/client");


// =======================
// MongoDB Connection
// =======================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// Middleware
// =======================
app.use(
  cors({
    origin: "http://127.0.0.1:5501", // frontend local
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve uploaded certificates
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

// =======================
// Routes
// =======================
const adminRoutes = require("./routes/adminRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/email");
const certificatesRoutes = require("./routes/certificatesRoutes");
const healthRecordRoutes = require("./routes/healthRecordRoutes");
const manageStudentRoutes = require("./routes/manageStudentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const recordRoutes = require("./routes/recordRoutes");
const registerRoutes = require("./routes/registerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingRoutes = require("./routes/settingRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const verifyTokenRoutes = require("./routes/verifyTokenRoutes");
const weeklyReportRoutes = require("./routes/weeklyReportRoutes");
const studentAuthRoutes = require("./routes/studentauthRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/faculty");
const staffRoutes = require("./routes/staff");
const statusRoutes = require ("./routes/statusRoutes");



// Mount
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/manage-student", manageStudentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/verify-token", verifyTokenRoutes);
app.use("/api/weekly-reports", weeklyReportRoutes);
app.use("/api/students/auth", studentAuthRoutes); // student register/login
app.use("/api/students", studentRoutes); 
app.use("/api/email", emailRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/staff", staffRoutes);// student CRUD
app.use("/api/status",statusRoutes);
// =======================
// Test MongoDB connection
// =======================
app.get("/api/test-db", async (req, res) => {
  try {
    const status = mongoose.connection.readyState;
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    res.json({ status: states[status] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =======================
// Serve Frontend
// =======================
app.use("/uploads/certificates", express.static(path.join(__dirname, "uploads/certificates")));

app.get("/:page.html", (req, res, next) => {
  const file = path.join(clientPath, req.params.page + ".html");
  res.sendFile(file, (err) => {
    if (err) next();
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// =======================
// 404 Handler
// =======================
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// =======================
// Error Handler
// =======================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong" });
});


// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
