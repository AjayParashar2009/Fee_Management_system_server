const jwt = require("jsonwebtoken");
const auth_data = require("../schema/authSchema");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "Fee_management_system";

// Verify JWT token
const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = await auth_data.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
};

// Check if user is accountant or admin
const accountant = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "accountant" || req.user.role === "admin")
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Accountant or Admin only.",
    });
  }
};

// ✅ Check if user is student or admin
const isStudent = (req, res, next) => {
  if (req.user && (req.user.role === "student" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Student or Admin only.",
    });
  }
};

module.exports = { verifyToken, isAdmin, accountant, isStudent };
