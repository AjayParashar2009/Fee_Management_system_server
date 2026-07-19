// Routes/feeCollectionRoute.js
const express = require("express");
const router = express.Router();
const {
  createFeeCollection,
  getFeeCollections,
  getFeeCollection,
  deleteFeeCollection,
  getFeeSummary,
} = require("../controllers/feeCollectionController");
const { auth, accountantOnly, studentOnly } = require("../middleware/auth");

// ✅ All routes require authentication
router.use(auth);

// ✅ Allow accountant and admin to view collections
router.get("/", accountantOnly, getFeeCollections);
router.get("/summary", accountantOnly, getFeeSummary);

// ✅ Allow accountant and admin to create and delete
router.post("/", accountantOnly, createFeeCollection);
router.get("/:id", accountantOnly, getFeeCollection);
router.delete("/:id", accountantOnly, deleteFeeCollection);

module.exports = router;
