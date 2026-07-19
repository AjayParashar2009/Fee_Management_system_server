const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getMe,
  logout,
} = require("../controllers/authController");
const { auth, adminOnly } = require("../middleware/auth");

router.post("/login", login);
router.get("/me", auth, getMe);
router.post("/logout", auth, logout);
router.post("/register", auth, adminOnly, register);

module.exports = router;
