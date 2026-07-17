const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth_data = require("../schema/authSchema");
const Student = require("../schema/studentSchema");
const Accountant = require("../schema/accountantSchema");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "Fee_management_system";

const login = async (req, res) => {
  const { username, password } = req.body; 
  console.log("Login attempt:", { username });

  try {
    // Find user by username or email
    const user = await auth_data.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }


    // Check status
    if (user.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Account is inactive. Contact admin.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      SECRET_KEY,
      { expiresIn: "7d" },
    );

    // Update last login time
    await auth_data.updateOne(
      { _id: user._id },
      { $set: { updatedAt: new Date() } },
    );

    // Get profile data based on role
    let profileData = null;
    try {
      if (user.role === "student") {
        profileData = await Student.findOne({ user: user._id });
        console.log("Student profile found:", profileData ? "Yes" : "No");
      } else if (user.role === "accountant") {
        profileData = await Accountant.findOne({ user: user._id });
        console.log("Accountant profile found:", profileData ? "Yes" : "No");
      }
    } catch (profileError) {
      console.error("Error fetching profile:", profileError);
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

// Register function (Admin only)
const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
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
      status: "Active",
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      SECRET_KEY,
      {
        expiresIn: "7d",
      },
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
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
    console.log("Getting profile for user:", req.user.id);

    // Find user
    const user = await auth_data.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found:", user.username, "Role:", user.role);

    let profileData = null;

    // Get profile based on role
    if (user.role === "student") {
      try {
        profileData = await Student.findOne({ user: user._id });
        console.log("Student profile found:", profileData ? "Yes" : "No");
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    } else if (user.role === "accountant") {
      try {
        profileData = await Accountant.findOne({ user: user._id });
        console.log("Accountant profile found:", profileData ? "Yes" : "No");
      } catch (err) {
        console.error("Error fetching accountant profile:", err);
      }
    }

    // Create response with user data
    const responseData = {
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage || null,
        lastLogin: user.lastLogin || null,
        createdAt: user.createdAt,
      },
    };

    if (profileData) {
      responseData.profile = profileData;
    } else {
      responseData.profile = {
        name: user.username,
        phone: "",
        course: "",
        semester: "",
        address: "",
        enrollmentNo: "",
        dob: "",
        totalFees: 0,
        paidFees: 0,
        pendingFees: 0,
        feeStatus: "Pending",
      };
    }

    console.log("Sending profile response");

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Get profile error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Logout function
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = { login, register, getMe, logout };
