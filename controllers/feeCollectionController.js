const FeeCollection = require("../schema/feeCollectionSchema");
const Student = require("../schema/studentSchema");
const Receipt = require("../schema/receiptSchema");
const auth_data = require("../schema/authSchema");

// @desc    Create a new fee collection
// @route   POST /api/fee-collections
// @access  Private/Accountant
const createFeeCollection = async (req, res) => {
  try {
    const { studentId, feeType, amount, paymentMethod, date, note } = req.body;

    // Validate required fields
    if (!studentId || !feeType || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
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
    const receiptNo = `RCPT${Date.now().toString().slice(-6)}`;
    const transactionId = `TXN${Date.now()}`;

    // Create fee collection record
    const feeCollection = await FeeCollection.create({
      student: studentId,
      feeType,
      amount,
      paymentMethod,
      transactionId,
      receiptNo,
      status: "Completed",
      date: date || new Date(),
      note: note || "",
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
      paymentMethod,
      date: date || new Date(),
      status: "Generated",
    });

    // Populate student data for response
    const populatedFee = await FeeCollection.findById(feeCollection._id)
      .populate("student", "name course semester enrollmentNo")
      .populate("collectedBy", "username email");

    return res.status(201).json({
      success: true,
      message: "Fee collected successfully",
      data: {
        feeCollection: populatedFee,
        receipt,
      },
    });
  } catch (error) {
    console.error("Create fee collection error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all fee collections
// @route   GET /api/fee-collections
// @access  Private/Accountant
const getFeeCollections = async (req, res) => {
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

    const feeCollections = await FeeCollection.find(query)
      .populate("student", "name course semester enrollmentNo phone")
      .populate("collectedBy", "username email")
      .sort({ date: -1 });

    // Calculate totals
    const totalAmount = feeCollections.reduce((sum, f) => sum + f.amount, 0);
    const totalCount = feeCollections.length;

    return res.status(200).json({
      success: true,
      count: totalCount,
      totalAmount,
      data: feeCollections,
    });
  } catch (error) {
    console.error("Get fee collections error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single fee collection
// @route   GET /api/fee-collections/:id
// @access  Private/Accountant
const getFeeCollection = async (req, res) => {
  try {
    const feeCollection = await FeeCollection.findById(req.params.id)
      .populate("student", "name course semester enrollmentNo phone email")
      .populate("collectedBy", "username email");

    if (!feeCollection) {
      return res.status(404).json({
        success: false,
        message: "Fee collection not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: feeCollection,
    });
  } catch (error) {
    console.error("Get fee collection error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update fee collection status
// @route   PUT /api/fee-collections/:id
// @access  Private/Accountant
const updateFeeCollection = async (req, res) => {
  try {
    const { status, note } = req.body;

    const feeCollection = await FeeCollection.findById(req.params.id);
    if (!feeCollection) {
      return res.status(404).json({
        success: false,
        message: "Fee collection not found",
      });
    }

    if (status) feeCollection.status = status;
    if (note) feeCollection.note = note;
    await feeCollection.save();

    return res.status(200).json({
      success: true,
      message: "Fee collection updated successfully",
      data: feeCollection,
    });
  } catch (error) {
    console.error("Update fee collection error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete fee collection
// @route   DELETE /api/fee-collections/:id
// @access  Private/Accountant
const deleteFeeCollection = async (req, res) => {
  try {
    const feeCollection = await FeeCollection.findById(req.params.id);
    if (!feeCollection) {
      return res.status(404).json({
        success: false,
        message: "Fee collection not found",
      });
    }

    // Remove receipt
    await Receipt.findOneAndDelete({ feeCollection: feeCollection._id });

    // Update student fees
    const student = await Student.findById(feeCollection.student);
    if (student) {
      student.paidFees = Math.max(
        0,
        (student.paidFees || 0) - feeCollection.amount,
      );
      student.pendingFees = (student.totalFees || 0) - student.paidFees;
      student.feeStatus = student.pendingFees <= 0 ? "Paid" : "Partial";
      await student.save();
    }

    await FeeCollection.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Fee collection deleted successfully",
    });
  } catch (error) {
    console.error("Delete fee collection error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get fee collection summary
// @route   GET /api/fee-collections/summary
// @access  Private/Accountant
const getFeeSummary = async (req, res) => {
  try {
    // Today's collection
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCollection = await FeeCollection.aggregate([
      {
        $match: {
          status: "Completed",
          date: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // This month's collection
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthCollection = await FeeCollection.aggregate([
      {
        $match: {
          status: "Completed",
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Pending collections
    const pendingCollection = await FeeCollection.aggregate([
      {
        $match: {
          status: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Total students with pending fees
    const pendingStudents = await Student.countDocuments({
      pendingFees: { $gt: 0 },
    });

    return res.status(200).json({
      success: true,
      data: {
        today: {
          total: todayCollection.length > 0 ? todayCollection[0].total : 0,
          count: todayCollection.length > 0 ? todayCollection[0].count : 0,
        },
        month: {
          total: monthCollection.length > 0 ? monthCollection[0].total : 0,
          count: monthCollection.length > 0 ? monthCollection[0].count : 0,
        },
        pending: {
          total: pendingCollection.length > 0 ? pendingCollection[0].total : 0,
          count: pendingCollection.length > 0 ? pendingCollection[0].count : 0,
        },
        pendingStudents,
      },
    });
  } catch (error) {
    console.error("Get fee summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createFeeCollection,
  getFeeCollections,
  getFeeCollection,
  updateFeeCollection,
  deleteFeeCollection,
  getFeeSummary,
};
