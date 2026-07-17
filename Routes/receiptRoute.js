const express = require("express");
const router = express.Router();
const {
  getReceipts,
  getReceipt,
  getReceiptByNumber,
  updateReceipt,
  generateReceiptPDF,
} = require("../controllers/receiptController");
const { verifyToken, accountant } = require("../middleware/auth");

// ✅ All routes require authentication and accountant role
router.use(verifyToken);
router.use(accountant);

// Routes
router.get("/", getReceipts);
router.get("/by-receipt/:receiptNo", getReceiptByNumber);
router.get("/:id", getReceipt);
router.put("/:id", updateReceipt);
router.post("/:id/generate-pdf", generateReceiptPDF);

module.exports = router;
