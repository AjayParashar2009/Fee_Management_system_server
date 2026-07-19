// Routes/feeStructureRoute.js
const express = require("express");
const router = express.Router();
const {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeStructureByCourse,
} = require("../controllers/feeStructureController");
const { auth, adminOnly } = require("../middleware/auth");

// ✅ All routes require authentication and admin role
router.use(auth);
router.use(adminOnly);

// Routes
router.get("/", getFeeStructures);
router.get("/course/:course", getFeeStructureByCourse);
router.post("/", createFeeStructure);
router.put("/:id", updateFeeStructure);
router.delete("/:id", deleteFeeStructure);

module.exports = router;
