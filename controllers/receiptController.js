const Receipt = require("../schema/receiptSchema");
const FeeCollection = require("../schema/feeCollectionSchema");
const Student = require("../schema/studentSchema");
const generateReceiptPDF = require("../utils/generateReceipt");
const path = require("path");
const fs = require("fs");

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Private (Student sees own, Accountant/Admin sees all)
const getReceipts = async (req, res) => {
  try {
    const { studentId, startDate, endDate, status } = req.query;

    let query = {};

    // If user is student, only show their own receipts
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        query.student = student._id;
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          totalAmount: 0,
          data: [],
        });
      }
    }

    if (studentId) query.student = studentId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const receipts = await Receipt.find(query)
      .populate("student", "name course semester enrollmentNo phone email")
      .populate("feeCollection", "amount paymentMethod transactionId")
      .sort({ date: -1 });

    const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

    return res.status(200).json({
      success: true,
      count: receipts.length,
      totalAmount,
      data: receipts,
    });
  } catch (error) {
    console.error("Get receipts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single receipt
// @route   GET /api/receipts/:id
// @access  Private (Student sees own, Accountant/Admin sees all)
const getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate(
        "student",
        "name course semester enrollmentNo phone email address",
      )
      .populate("feeCollection", "amount paymentMethod transactionId date");

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if student is accessing their own record
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user.id });
      if (
        student &&
        receipt.student._id.toString() !== student._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error("Get receipt error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get receipt by receipt number
// @route   GET /api/receipts/by-receipt/:receiptNo
// @access  Private (Student sees own, Accountant/Admin sees all)
const getReceiptByNumber = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ receiptNo: req.params.receiptNo })
      .populate(
        "student",
        "name course semester enrollmentNo phone email address",
      )
      .populate("feeCollection", "amount paymentMethod transactionId date");

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if student is accessing their own record
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user.id });
      if (
        student &&
        receipt.student._id.toString() !== student._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error("Get receipt by number error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update receipt status
// @route   PUT /api/receipts/:id
// @access  Private/Accountant
const updateReceipt = async (req, res) => {
  try {
    const { status, pdfUrl } = req.body;

    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    if (status) receipt.status = status;
    if (pdfUrl) receipt.pdfUrl = pdfUrl;
    await receipt.save();

    return res.status(200).json({
      success: true,
      message: "Receipt updated successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("Update receipt error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Generate and download receipt PDF
// @route   POST /api/receipts/:id/generate-pdf
// @access  Private (Student can generate own, Accountant/Admin can generate all)
const generateReceiptPDFController = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate(
        "student",
        "name course semester enrollmentNo phone email address",
      )
      .populate(
        "feeCollection",
        "amount paymentMethod transactionId date feeType status",
      );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if student is accessing their own record
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user.id });
      if (
        student &&
        receipt.student._id.toString() !== student._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Prepare data for PDF
    const receiptData = {
      receiptNo: receipt.receiptNo,
      date: receipt.date,
      transactionId: receipt.feeCollection?.transactionId || `TXN${Date.now()}`,
      amount: receipt.amount,
      feeType: receipt.feeType,
      paymentMethod: receipt.paymentMethod,
      status: receipt.status,
      student: {
        name: receipt.student?.name || "N/A",
        course: receipt.student?.course || "N/A",
        semester: receipt.student?.semester || "N/A",
        enrollmentNo: receipt.student?.enrollmentNo || "N/A",
        email: receipt.student?.email || "N/A",
        phone: receipt.student?.phone || "N/A",
      },
    };

    console.log("📄 Generating PDF for receipt:", receiptData.receiptNo);

    // Generate PDF
    const pdfResult = await generateReceiptPDF(receiptData);

    // Update receipt with PDF URL
    receipt.pdfUrl = pdfResult.url;
    receipt.status = "Generated";
    await receipt.save();

    console.log("✅ PDF generated:", pdfResult.filename);

    return res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      data: {
        receipt,
        pdfUrl: pdfResult.url,
        downloadUrl: `${process.env.API_URL || "http://localhost:3000"}${pdfResult.url}`,
      },
    });
  } catch (error) {
    console.error("❌ Generate PDF error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF",
    });
  }
};

// @desc    Download receipt PDF
// @route   GET /api/receipts/:id/download-pdf
// @access  Private (Student can download own, Accountant/Admin can download all)
const downloadReceiptPDF = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if student is accessing their own record
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user.id });
      if (student && receipt.student.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    if (!receipt.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "PDF not generated yet. Please generate first.",
      });
    }

    // Get file path
    const filePath = path.join(__dirname, "..", receipt.pdfUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "PDF file not found",
      });
    }

    // Send file for download
    res.download(filePath, `${receipt.receiptNo}.pdf`);
  } catch (error) {
    console.error("Download PDF error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download PDF",
    });
  }
};

module.exports = {
  getReceipts,
  getReceipt,
  getReceiptByNumber,
  updateReceipt,
  generateReceiptPDFController,
  downloadReceiptPDF,
};
