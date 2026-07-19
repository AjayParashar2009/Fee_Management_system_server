// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth_data = require("../schema/authSchema"); // ✅ Import from schema
const Student = require("../schema/studentSchema"); // ✅ If you have separate student schema
const Accountant = require("../schema/accountantSchema"); // ✅ If you have separate accountant schema
const dotenv = require("dotenv");

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "Fee_management_system";

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await auth_data.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Account is inactive. Contact admin.",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "7d" },
    );

    // Get profile based on role
    let profileData = null;
    if (user.role === "student") {
      profileData = await Student.findOne({ user: user._id });
    } else if (user.role === "accountant") {
      profileData = await Accountant.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      profile: profileData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Register (Admin only)
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      status,
      name,
      phone,
      address,
      dob,
      course,
      semester,
    } = req.body;

    const existing_user = await auth_data.findOne({
      $or: [{ username }, { email }],
    });

    if (existing_user) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await auth_data.create({
      username,
      email,
      password: hashPassword,
      role: role || "student",
      status: status || "Active",
    });

    // If role is student, create student profile
    if (user.role === "student") {
      await Student.create({
        user: user._id,
        name: name || username,
        phone: phone || "",
        course: course || "",
        semester: semester || 1,
        address: address || "",
        dob: dob || "",
        enrollmentNo: `STU${Date.now().toString().slice(-6)}`,
        status: "Active",
      });
    }

    // If role is accountant, create accountant profile
    if (user.role === "accountant") {
      await Accountant.create({
        user: user._id,
        name: name || username,
        phone: phone || "",
        department: "Fee Collection",
        address: address || "",
        employeeId: `ACC${Date.now().toString().slice(-6)}`,
        status: "Active",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get user profile
const getMe = async (req, res) => {
  try {
    const user = await auth_data.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profileData = null;
    if (user.role === "student") {
      profileData = await Student.findOne({ user: user._id });
    } else if (user.role === "accountant") {
      profileData = await Accountant.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        profile: profileData,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Logout
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = { login, register, getMe, logout };
