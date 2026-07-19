// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../schema/authSchema"); // or auth_data
const dotenv = require("dotenv");

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "Fee_management_system";

// Authenticate user
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    if (user.status !== "Active") {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

// ✅ Admin only
const adminOnly = (req, res, next) => {
  if (req.user.role === "admin") return next();
  return res
    .status(403)
    .json({ success: false, message: "Admin access required" });
};

// ✅ Accountant or Admin
const accountantOnly = (req, res, next) => {
  // ✅ Allow both accountant and admin roles
  if (req.user.role === "accountant" || req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Accountant or Admin only.",
  });
};

// ✅ Student or Admin
const studentOnly = (req, res, next) => {
  if (req.user.role === "student" || req.user.role === "admin") return next();
  return res
    .status(403)
    .json({ success: false, message: "Student access required" });
};

module.exports = { auth, adminOnly, accountantOnly, studentOnly };
