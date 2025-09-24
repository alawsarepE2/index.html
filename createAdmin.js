const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Users = require("./models/Users");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existing = await Admin.findOne({ email: "admin@school.com" });
    if (existing) {
      console.log("⚠️ Admin already exists:", existing.email);
      return mongoose.disconnect();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new Admin({
      firstName: "Super",
      lastName: "Admin",
      email: "jeyceesirc@gmail.com",
      password: hashedPassword
    });

    await admin.save();
    console.log("✅ Admin created:", admin.email);
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    mongoose.disconnect();
  }
};

createAdmin();
