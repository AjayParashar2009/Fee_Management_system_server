const crypto = require("crypto");
const Payment = require("../schema/payment");
const Student = require("../schema/studentSchema");
const FeeCollection = require("../schema/feeCollectionSchema");
const Receipt = require("../schema/receiptSchema");
const { sendPaymentConfirmation } = require("../services/emailService");
const generateReceiptPDF = require("../utils/generateReceipt");

// @desc    Create a new payment order
// @route   POST /api/payments/create-order
// @access  Private (Student)
const createOrder = async (req, res) => {
  try {
    const { amount, feeType, studentId } = req.body;

    if (!amount || !feeType || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Amount, feeType and studentId are required",
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Generate receipt number
    const receipt = `RCPT_${Date.now()}`;

    const payment = await Payment.create({
      student: studentId,
      user: req.user.id,
      orderId: `PAY-${Date.now()}`,
      amount: amount,
      feeType: feeType,
      receipt: receipt,
      status: "Pending",
      notes: {
        studentName: student.name,
        course: student.course,
        semester: student.semester,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created locally. Razorpay integration is disabled.",
      data: {
        orderId: payment.orderId,
        amount: amount,
        currency: "INR",
        receipt: receipt,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (Student)
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, studentId, feeType, amount } =
      req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "orderId and paymentId are required",
      });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { orderId: orderId },
      {
        paymentId: paymentId,
        signature: signature,
        status: "Paid",
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Create fee collection record
    const receiptNo = `RCPT${Date.now().toString().slice(-6)}`;
    const transactionId = `TXN${Date.now()}`;

    const feeCollection = await FeeCollection.create({
      student: studentId,
      feeType: feeType,
      amount: amount,
      paymentMethod: "Online",
      transactionId: transactionId,
      receiptNo: receiptNo,
      status: "Completed",
      date: new Date(),
      note: `Online payment via Razorpay - ${paymentId}`,
      collectedBy: req.user.id,
    });

    // Update student fees
    student.paidFees = (student.paidFees || 0) + amount;
    student.pendingFees = (student.totalFees || 0) - student.paidFees;
    student.feeStatus = student.pendingFees <= 0 ? "Paid" : "Partial";
    await student.save();

    // Create receipt
    const receipt = await Receipt.create({
      receiptNo,
      student: studentId,
      feeCollection: feeCollection._id,
      amount,
      feeType,
      paymentMethod: "Online",
      date: new Date(),
      status: "Generated",
    });

    // Generate PDF
    let pdfResult = null;
    try {
      const receiptData = {
        receiptNo: receipt.receiptNo,
        date: receipt.date,
        transactionId: feeCollection.transactionId,
        amount: receipt.amount,
        feeType: receipt.feeType,
        paymentMethod: "Online",
        status: receipt.status,
        student: {
          name: student.name,
          course: student.course,
          semester: student.semester,
          enrollmentNo: student.enrollmentNo,
          email: student.email || "N/A",
          phone: student.phone,
        },
      };

      pdfResult = await generateReceiptPDF(receiptData);
      receipt.pdfUrl = pdfResult.url;
      await receipt.save();
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError.message);
    }

    // Send email confirmation
    try {
      await sendPaymentConfirmation({
        email: student.email,
        studentName: student.name,
        receiptNo: receipt.receiptNo,
        amount: amount,
        feeType: feeType,
        date: new Date(),
        paymentMethod: "Online",
        transactionId: transactionId,
        course: student.course,
        semester: student.semester,
      });
    } catch (emailError) {
      console.error("Email not sent:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        receipt: receipt,
        feeCollection: feeCollection,
        pdfUrl: pdfResult ? pdfResult.url : null,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:orderId
// @access  Private (Student)
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ orderId })
      .populate("student", "name course semester enrollmentNo")
      .populate("user", "username email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if user has access to this payment
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user.id });
      if (
        student &&
        payment.student._id.toString() !== student._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all payments for a student
// @route   GET /api/payments/student
// @access  Private (Student)
const getStudentPayments = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const payments = await Payment.find({ student: student._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Get student payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getStudentPayments,
};
