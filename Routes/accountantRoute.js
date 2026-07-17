const express = require("express");
const router = express.Router();
const {
  createAccountant,
  getAccountants,
  getAccountant,
  updateAccountant,
  deleteAccountant,
} = require("../controllers/accountantController");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ✅ All routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Accountant routes
router.route("/").get(getAccountants).post(createAccountant);

router
  .route("/:id")
  .get(getAccountant)
  .put(updateAccountant)
  .delete(deleteAccountant);

module.exports = router;
