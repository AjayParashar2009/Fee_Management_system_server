const Receipt = require("../schema/receiptSchema");
const FeeCollection = require("../schema/feeCollectionSchema");
const Student = require("../schema/studentSchema");

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Private/Accountant
const getReceipts = async (req, res) => {
  try {
    const { studentId, startDate, endDate, status } = req.query;

    let query = {};
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
// @access  Private/Accountant
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
// @access  Private/Accountant
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

// @desc    Generate receipt PDF (placeholder)
// @route   POST /api/receipts/:id/generate-pdf
// @access  Private/Accountant
const generateReceiptPDF = async (req, res) => {
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

    // TODO: Generate actual PDF using pdfkit
    // For now, return success message
    receipt.status = "Generated";
    receipt.pdfUrl = `/receipts/${receipt.receiptNo}.pdf`;
    await receipt.save();

    return res.status(200).json({
      success: true,
      message: "Receipt PDF generated successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("Generate receipt PDF error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getReceipts,
  getReceipt,
  getReceiptByNumber,
  updateReceipt,
  generateReceiptPDF,
};
