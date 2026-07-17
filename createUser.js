// save as createUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const auth_data = require("./schema/authSchema");

mongoose.connect("mongodb://localhost:27017/fee_management");

const createUser = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    await auth_data.create({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      status: "Active",
    });

    console.log("✅ Admin user created!");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
  }
};

createUser();
