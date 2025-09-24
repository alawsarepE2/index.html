// assignAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User"); // ✅ make sure you have User model

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Replace with the email of the user you want to make admin
const email = "adminlucena@gmail.com"; // 👈 change this to the target user

async function assignAdminRole() {
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log(`✅ Admin role assigned to user: ${user.email}, role: ${user.role}`);
  } catch (error) {
    console.error("❌ Error assigning admin role:", error.message);
  } finally {
    mongoose.disconnect();
  }
}

assignAdminRole();
