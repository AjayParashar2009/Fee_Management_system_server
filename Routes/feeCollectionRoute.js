const express = require("express");
const router = express.Router();
const {
  createFeeCollection,
  getFeeCollections,
  getFeeCollection,
  updateFeeCollection,
  deleteFeeCollection,
  getFeeSummary,
} = require("../controllers/feeCollectionController");
const { verifyToken, accountant, isStudent } = require("../Middleware/auth");

// All routes require authentication
router.use(verifyToken);

// Students can view their own fee collections
router.get("/", isStudent, getFeeCollections);
router.get("/summary", accountant, getFeeSummary);

// Accountant/Admin can create, update, delete
router.post("/", accountant, createFeeCollection);
router.get("/:id", isStudent, getFeeCollection);
router.put("/:id", accountant, updateFeeCollection);
router.delete("/:id", accountant, deleteFeeCollection);

module.exports = router;
