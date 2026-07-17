const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getMe,
  logout,
} = require("../Config/auth");
const { verifyToken, isAdmin } = require("../middleware/auth");

// Public routes (no token required)
router.post("/login", login);

// Protected routes (token required)
router.get("/me", verifyToken, getMe);
router.post("/logout", verifyToken, logout);

// Admin only routes
router.post("/register", verifyToken, isAdmin, register);

module.exports = router;
