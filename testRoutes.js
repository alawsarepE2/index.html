// testRoutes.js
const fetch = require("node-fetch"); // Make sure v2 is used

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

const API_BASE = "http://localhost:5000";

const studentId = "STU123"; // Replace with an existing student ID
const testEmail = "student@example.com";
const testPassword = "password123";

async function test() {
  console.log("🚀 Testing backend routes...\n");

  // 1️⃣ Test Firestore connection
  try {
    const res = await fetch(`${API_BASE}/api/test-db`);
    const data = await res.json();
    console.log("✅ /api/test-db:", data);
  } catch (err) {
    console.error("❌ /api/test-db:", err.message);
  }

  // 2️⃣ Test student registration
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        email: testEmail,
        contact: "09171234567",
        password: testPassword,
        role: "student",
      }),
    });
    const data = await res.json();
    console.log("✅ /api/auth/register:", data);
  } catch (err) {
    console.error("❌ /api/auth/register:", err.message);
  }

  // 3️⃣ Test student login
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const data = await res.json();
    console.log("✅ /api/auth/login:", data);
  } catch (err) {
    console.error("❌ /api/auth/login:", err.message);
  }

  // 4️⃣ Test all reports
  try {
    const res = await fetch(`${API_BASE}/api/reports`);
    const data = await res.json();
    console.log("✅ /api/reports:", data);
  } catch (err) {
    console.error("❌ /api/reports:", err.message);
  }

  // 5️⃣ Test student reports
  try {
    const res = await fetch(`${API_BASE}/api/reports/student/${studentId}`);
    const data = await res.json();
    console.log(`✅ /api/reports/student/${studentId}:`, data);
  } catch (err) {
    console.error(`❌ /api/reports/student/${studentId}:`, err.message);
  }

  // 6️⃣ Test all announcements for student
  try {
    const res = await fetch(`${API_BASE}/api/announcements/student/${studentId}`);
    const data = await res.json();
    console.log(`✅ /api/announcements/student/${studentId}:`, data);
  } catch (err) {
    console.error(`❌ /api/announcements/student/${studentId}:`, err.message);
  }

  console.log("\n✅ Testing complete!");
}

test();

