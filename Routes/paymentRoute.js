const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getStudentPayments,
} = require("../controllers/paymentController");
const { verifyToken, isStudent } = require("../Middleware/auth");

// All routes require authentication
router.use(verifyToken);

// Student routes
router.post("/create-order", isStudent, createOrder);
router.post("/verify", isStudent, verifyPayment);
router.get("/student", isStudent, getStudentPayments);
router.get("/:orderId", isStudent, getPaymentStatus);

module.exports = router;
