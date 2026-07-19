const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

// Apply authentication to all dashboard routes (no endpoints yet)
router.use(auth);

module.exports = router;
