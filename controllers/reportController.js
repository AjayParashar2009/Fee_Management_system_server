// controllers/reportController.js - SIMPLIFIED VERSION
const FeeCollection = require("../schema/feeCollectionSchema");
const Student = require("../schema/studentSchema");
const auth_data = require("../schema/authSchema");

const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const [totalStudents, totalAccountants] = await Promise.all([
      Student.countDocuments(),
      auth_data.countDocuments({ role: "accountant" }),
    ]);

    // Get collections
    const collections = await FeeCollection.find({ status: "Completed" });
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);

    // Get pending students
    const pendingStudents = await Student.countDocuments({
      pendingFees: { $gt: 0 },
    });

    // Get today's collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCollections = await FeeCollection.find({
      status: "Completed",
      date: { $gte: today },
    });
    const todayTotal = todayCollections.reduce((sum, c) => sum + c.amount, 0);

    // Get recent collections
    const recent = await FeeCollection.find({ status: "Completed" })
      .populate("student", "name course")
      .sort({ date: -1 })
      .limit(5);

    // Get status breakdown
    const statusBreakdown = await Student.aggregate([
      { $group: { _id: "$feeStatus", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalAccountants,
        totalCollected,
        totalCollections: collections.length,
        pendingFees: collections.reduce((sum, c) => sum + c.amount, 0),
        pendingStudents,
        today: {
          total: todayTotal,
          count: todayCollections.length,
        },
        month: {
          total: totalCollected,
          count: collections.length,
        },
        statusBreakdown,
        recent,
      },
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFeeReport = async (req, res) => {
  try {
    const students = await Student.find().populate("user", "username email");
    res.json({
      success: true,
      data: {
        summary: {
          totalStudents: students.length,
          paidStudents: students.filter((s) => s.feeStatus === "Paid").length,
          partialStudents: students.filter((s) => s.feeStatus === "Partial")
            .length,
          pendingStudents: students.filter((s) => s.feeStatus === "Pending")
            .length,
          totalCollected: students.reduce((sum, s) => sum + s.paidFees, 0),
          totalPending: students.reduce((sum, s) => sum + s.pendingFees, 0),
          collectionRate:
            students.length > 0
              ? Math.round(
                  (students.filter((s) => s.feeStatus === "Paid").length /
                    students.length) *
                    100,
                )
              : 0,
        },
        students,
      },
    });
  } catch (error) {
    console.error("❌ Fee report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getFeeReport,
};
