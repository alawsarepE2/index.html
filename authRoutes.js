const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const User = require("../models/User");


const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// =======================
// ✅ Student Registration
// =======================
// routes/auth.js

// ==================== REGISTER ====================
// ==================== REGISTER ====================
// ==================== REGISTER ====================
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, studentId, contact } = req.body;

    if (!email || !password || !firstName || !lastName || !studentId || !contact) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if email or studentId exists
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ error: existingUser.email === normalizedEmail ? "Email already registered" : "Student ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      firstName,
      lastName,
      studentId,
      contact
    });

    await user.save();

    // JWT
    const token = jwt.sign({ _id: user._id, role: user.role, studentId: user.studentId }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName,
        lastName,
        studentId,
        contact
      }
    });
  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log("🔐 Incoming login:", { email, role });

    // Validate input
    if (!email || !password || !role) {
      console.warn("⚠️ Missing fields in login request");
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!["student", "admin"].includes(role)) {
      console.warn(`⚠️ Unsupported role attempted: ${role}`);
      return res.status(403).json({ error: "Unsupported role" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, role });

    if (!user) {
      console.warn(`❌ No user found for ${normalizedEmail} with role ${role}`);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    console.log("✅ User found:", {
      id: user._id,
      email: user.email,
      role: user.role,
      storedHash: user.password
    });

    // Log raw password and its length
    console.log("🔑 Raw password received:", `"${password}"`, "Length:", password.length);

    // Compare password
    const match = await user.comparePassword(password.trim());
    console.log("🔍 Password match result:", match);

    if (!match) {
      console.warn(`❌ Password mismatch for ${normalizedEmail}`);
      console.warn("🧪 Stored hash:", user.password);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Prepare token payload
    const tokenPayload = {
      _id: user._id,
      role: user.role,
      ...(role === "student" && { studentId: user.studentId })
    };

    console.log("🧾 Token payload preview:", tokenPayload);

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    // Prepare user response
    const userResponse = {
      _id: user._id,
      role: user.role,
      email: user.email,
      ...(role === "student" && {
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentId
      }),
      ...(role === "admin" && {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      })
    };

    console.log("📦 Final user response:", userResponse);
    console.log("✅ Login successful for:", normalizedEmail);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if user exists in either Student or Admin collections
    const student = await Student.findOne({ email: email.toLowerCase() });
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    const user = student || admin;

    if (!user) {
      return res.status(404).json({ error: "No account found with that email" });
    }

    // Simulate sending a reset link (you can integrate actual email logic later)
    console.log(`📧 Sending password reset link to ${email}`);

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ error: "Server error during password reset" });
  }
});
router.post("/refresh-token", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "No refresh token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newToken = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        ...(user.role === "student" && { studentId: user.studentId })
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      accessToken: newToken,
      user: {
        role: user.role
      }
    });
  } catch (err) {
    console.error("🔄 Refresh error:", err.message);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});



module.exports = router;
