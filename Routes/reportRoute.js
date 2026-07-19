const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getFeeReport,
} = require("../controllers/reportController");
const { auth, accountantOnly } = require("../middleware/auth");

router.use(auth);
router.use(accountantOnly);

router.get("/dashboard", getDashboardStats);
router.get("/fee", getFeeReport);

module.exports = router;
