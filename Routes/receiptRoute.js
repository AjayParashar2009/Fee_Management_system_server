const express = require("express");
const router = express.Router();
const {
  getReceipts,
  getReceipt,
  getReceiptByNumber,
  updateReceipt,
  generateReceiptPDFController,
  downloadReceiptPDF,
} = require("../controllers/receiptController");
const { verifyToken, accountant, isStudent } = require("../middleware/auth");

// All routes require authentication
router.use(verifyToken);

// Students can view their own receipts
router.get("/", isStudent, getReceipts);
router.get("/by-receipt/:receiptNo", isStudent, getReceiptByNumber);
router.get("/:id", isStudent, getReceipt);

// PDF generation - Students can generate their own receipts
router.post("/:id/generate-pdf", isStudent, generateReceiptPDFController);
router.get("/:id/download-pdf", isStudent, downloadReceiptPDF);

// Accountant/Admin can update receipts
router.put("/:id", accountant, updateReceipt);

module.exports = router;
