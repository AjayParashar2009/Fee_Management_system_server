const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getStudentPayments,
} = require("../controllers/paymentController");
const { auth, studentOnly } = require("../middleware/auth");

router.use(auth);

router.post("/create-order", studentOnly, createOrder);
router.post("/verify", studentOnly, verifyPayment);
router.get("/student", studentOnly, getStudentPayments);
router.get("/:orderId", studentOnly, getPaymentStatus);

module.exports = router;
