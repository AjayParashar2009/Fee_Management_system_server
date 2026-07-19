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
const { auth, accountantOnly, studentOnly } = require("../middleware/auth");

router.use(auth);

router.get("/", studentOnly, getReceipts);
router.get("/by-receipt/:receiptNo", studentOnly, getReceiptByNumber);
router.get("/:id", studentOnly, getReceipt);
router.post("/:id/generate-pdf", studentOnly, generateReceiptPDFController);
router.get("/:id/download-pdf", studentOnly, downloadReceiptPDF);
router.put("/:id", accountantOnly, updateReceipt);

module.exports = router;
