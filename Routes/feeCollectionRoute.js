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
const { verifyToken, accountant } = require("../middleware/auth");

// ✅ All routes require authentication and accountant role
router.use(verifyToken);
router.use(accountant);

// Routes
router.route("/").get(getFeeCollections).post(createFeeCollection);

router.route("/summary").get(getFeeSummary);

router
  .route("/:id")
  .get(getFeeCollection)
  .put(updateFeeCollection)
  .delete(deleteFeeCollection);

module.exports = router;
