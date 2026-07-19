const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/auth");

// Notification routes placeholder
router.use(auth);

module.exports = router;
