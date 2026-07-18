const express = require("express");
const router = express.Router();
const {
  createFeeStructure,
  getFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeStructureByCourse,
} = require("../controllers/feeStructureController");
const { verifyToken, isAdmin } = require("../Middleware/auth");

// All routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Routes
router.route("/").get(getFeeStructures).post(createFeeStructure);

router.get("/course/:course", getFeeStructureByCourse);

router
  .route("/:id")
  .get(getFeeStructure)
  .put(updateFeeStructure)
  .delete(deleteFeeStructure);

module.exports = router;
