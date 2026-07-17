const express = require("express");
const router = express.Router();
const {
  getFeeReport,
  getCollectionReport,
  getReceiptReport,
  getDashboardStats,
} = require("../controllers/reportController");
const { verifyToken, accountant } = require("../middleware/auth");

// ✅ All routes require authentication and accountant role
router.use(verifyToken);
router.use(accountant);

// Routes
router.get("/dashboard", getDashboardStats);
router.get("/fee", getFeeReport);
router.get("/collection", getCollectionReport);
router.get("/receipt", getReceiptReport);

module.exports = router;
