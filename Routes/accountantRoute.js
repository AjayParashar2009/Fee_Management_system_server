const express = require("express");
const router = express.Router();
const {
  getAccountants,
  createAccountant,
  updateAccountant,
  deleteAccountant,
} = require("../controllers/accountantController");
const { auth, adminOnly } = require("../middleware/auth");

router.use(auth);
router.use(adminOnly);
router.get("/", getAccountants);
router.post("/", createAccountant);
router.put("/:id", updateAccountant);
router.delete("/:id", deleteAccountant);

module.exports = router;
