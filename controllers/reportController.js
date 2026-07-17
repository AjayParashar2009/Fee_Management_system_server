const FeeCollection = require("../schema/feeCollectionSchema");
const Student = require("../schema/studentSchema");
const Receipt = require("../schema/receiptSchema");

// @desc    Get fee report
// @route   GET /api/reports/fee
// @access  Private/Accountant
const getFeeReport = async (req, res) => {
  try {
    const { course, semester, startDate, endDate } = req.query;

    // Build student filter
    let studentFilter = {};
    if (course) studentFilter.course = course;
    if (semester) studentFilter.semester = semester;

    // Get all students matching filter
    const students = await Student.find(studentFilter).populate(
      "user",
      "username email",
    );

    // Get fee collections for these students
    const studentIds = students.map((s) => s._id);
    let collectionFilter = { student: { $in: studentIds } };
    if (startDate || endDate) {
      collectionFilter.date = {};
      if (startDate) collectionFilter.date.$gte = new Date(startDate);
      if (endDate) collectionFilter.date.$lte = new Date(endDate);
    }

    const collections = await FeeCollection.find(collectionFilter)
      .populate("student", "name course semester enrollmentNo")
      .populate("collectedBy", "username email")
      .sort({ date: -1 });

    // Calculate summary
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);
    const totalPending = students.reduce(
      (sum, s) => sum + (s.pendingFees || 0),
      0,
    );
    const totalStudents = students.length;
    const paidStudents = students.filter((s) => s.feeStatus === "Paid").length;
    const partialStudents = students.filter(
      (s) => s.feeStatus === "Partial",
    ).length;
    const pendingStudents = students.filter(
      (s) => s.feeStatus === "Pending",
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          paidStudents,
          partialStudents,
          pendingStudents,
          totalCollected,
          totalPending,
          collectionRate:
            totalStudents > 0
              ? Math.round((paidStudents / totalStudents) * 100)
              : 0,
        },
        students: students.map((s) => ({
          _id: s._id,
          name: s.name,
          course: s.course,
          semester: s.semester,
          enrollmentNo: s.enrollmentNo,
          totalFees: s.totalFees || 0,
          paidFees: s.paidFees || 0,
          pendingFees: s.pendingFees || 0,
          feeStatus: s.feeStatus,
          status: s.status,
        })),
        collections,
      },
    });
  } catch (error) {
    console.error("Get fee report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get collection report
// @route   GET /api/reports/collection
// @access  Private/Accountant
const getCollectionReport = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;

    let filter = { status: "Completed" };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const collections = await FeeCollection.find(filter)
      .populate("student", "name course semester enrollmentNo")
      .populate("collectedBy", "username email")
      .sort({ date: -1 });

    // Group by payment method
    const methodSummary = {};
    collections.forEach((c) => {
      if (!methodSummary[c.paymentMethod]) {
        methodSummary[c.paymentMethod] = { count: 0, total: 0 };
      }
      methodSummary[c.paymentMethod].count += 1;
      methodSummary[c.paymentMethod].total += c.amount;
    });

    // Group by date
    const dailySummary = {};
    collections.forEach((c) => {
      const dateKey = c.date.toISOString().split("T")[0];
      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = { count: 0, total: 0 };
      }
      dailySummary[dateKey].count += 1;
      dailySummary[dateKey].total += c.amount;
    });

    const totalAmount = collections.reduce((sum, c) => sum + c.amount, 0);
    const totalCount = collections.length;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalAmount,
          totalCount,
          averageAmount:
            totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
        },
        methodSummary,
        dailySummary: Object.entries(dailySummary).map(([date, data]) => ({
          date,
          ...data,
        })),
        collections,
      },
    });
  } catch (error) {
    console.error("Get collection report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get receipt report
// @route   GET /api/reports/receipt
// @access  Private/Accountant
const getReceiptReport = async (req, res) => {
  try {
    const { startDate, endDate, studentId } = req.query;

    let filter = {};
    if (studentId) filter.student = studentId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const receipts = await Receipt.find(filter)
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
    console.error("Get receipt report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private/Accountant
const getDashboardStats = async (req, res) => {
  try {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's collections
    const todayCollections = await FeeCollection.aggregate([
      {
        $match: {
          status: "Completed",
          date: { $gte: today },
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

    // This month's collections
    const monthCollections = await FeeCollection.aggregate([
      {
        $match: {
          status: "Completed",
          date: { $gte: monthStart },
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

    // Total students
    const totalStudents = await Student.countDocuments();

    // Pending fees
    const pendingStudents = await Student.countDocuments({
      pendingFees: { $gt: 0 },
    });

    const pendingFeeTotal = await Student.aggregate([
      {
        $match: { pendingFees: { $gt: 0 } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$pendingFees" },
        },
      },
    ]);

    // Fee status breakdown
    const statusBreakdown = await Student.aggregate([
      {
        $group: {
          _id: "$feeStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent collections
    const recentCollections = await FeeCollection.find({ status: "Completed" })
      .populate("student", "name course")
      .sort({ date: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        today: {
          total: todayCollections.length > 0 ? todayCollections[0].total : 0,
          count: todayCollections.length > 0 ? todayCollections[0].count : 0,
        },
        month: {
          total: monthCollections.length > 0 ? monthCollections[0].total : 0,
          count: monthCollections.length > 0 ? monthCollections[0].count : 0,
        },
        students: {
          total: totalStudents,
          pending: pendingStudents,
        },
        pendingFees: {
          total: pendingFeeTotal.length > 0 ? pendingFeeTotal[0].total : 0,
          students: pendingStudents,
        },
        statusBreakdown,
        recentCollections,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getFeeReport,
  getCollectionReport,
  getReceiptReport,
  getDashboardStats,
};
