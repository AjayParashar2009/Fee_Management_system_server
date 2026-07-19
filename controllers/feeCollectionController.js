// controllers/feeCollectionController.js
const FeeCollection = require("../schema/feeCollectionSchema");
const Student = require("../schema/studentSchema");
const auth_data = require("../schema/authSchema");

// Create fee collection
const createFeeCollection = async (req, res) => {
  try {
    const { studentId, amount, feeType, paymentMethod, note } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const receiptNo = `RCPT${Date.now().toString().slice(-6)}`;
    const transactionId = `TXN${Date.now()}`;

    const collection = await FeeCollection.create({
      student: studentId,
      amount,
      feeType,
      paymentMethod: paymentMethod || "Cash",
      receiptNo,
      transactionId,
      collectedBy: req.userId,
      note: note || "",
      status: "Completed",
    });

    // Update student fees
    student.paidFees = (student.paidFees || 0) + amount;
    student.pendingFees = (student.totalFees || 0) - student.paidFees;
    student.feeStatus =
      student.pendingFees <= 0
        ? "Paid"
        : student.paidFees > 0
          ? "Partial"
          : "Pending";
    await student.save();

    const populated = await FeeCollection.findById(collection._id)
      .populate("student", "name course semester enrollmentNo")
      .populate("collectedBy", "username");

    res.status(201).json({
      success: true,
      message: "Fee collected successfully",
      data: populated,
      receipt: {
        receiptNo,
        student: student.name,
        amount,
        date: collection.date,
      },
    });
  } catch (error) {
    console.error("Create fee collection error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all fee collections
const getFeeCollections = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.userId });
      if (student) {
        query.student = student._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    const { startDate, endDate, status } = req.query;
    if (startDate) query.date = { ...query.date, $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
    if (status) query.status = status;

    const collections = await FeeCollection.find(query)
      .populate("student", "name course semester enrollmentNo")
      .populate("collectedBy", "username")
      .sort({ date: -1 });

    const totalAmount = collections.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      success: true,
      count: collections.length,
      totalAmount,
      data: collections,
    });
  } catch (error) {
    console.error("Get fee collections error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single fee collection
const getFeeCollection = async (req, res) => {
  try {
    const collection = await FeeCollection.findById(req.params.id)
      .populate("student", "name course semester enrollmentNo")
      .populate("collectedBy", "username");

    if (!collection) {
      return res
        .status(404)
        .json({ success: false, message: "Collection not found" });
    }

    // Check if student is accessing their own record
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.userId });
      if (
        student &&
        collection.student._id.toString() !== student._id.toString()
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    res.json({ success: true, data: collection });
  } catch (error) {
    console.error("Get fee collection error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete fee collection (Admin only)
const deleteFeeCollection = async (req, res) => {
  try {
    const collection = await FeeCollection.findById(req.params.id);
    if (!collection) {
      return res
        .status(404)
        .json({ success: false, message: "Collection not found" });
    }

    // Reverse fee update
    const student = await Student.findById(collection.student);
    if (student) {
      student.paidFees = Math.max(
        0,
        (student.paidFees || 0) - collection.amount,
      );
      student.pendingFees = (student.totalFees || 0) - student.paidFees;
      student.feeStatus =
        student.pendingFees <= 0
          ? "Paid"
          : student.paidFees > 0
            ? "Partial"
            : "Pending";
      await student.save();
    }

    await FeeCollection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Collection deleted" });
  } catch (error) {
    console.error("Delete fee collection error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get fee summary
const getFeeSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const todayCollection = await FeeCollection.aggregate([
      { $match: { status: "Completed", date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const monthCollection = await FeeCollection.aggregate([
      {
        $match: {
          status: "Completed",
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const pendingStudents = await Student.countDocuments({
      pendingFees: { $gt: 0 },
    });

    res.json({
      success: true,
      data: {
        today: {
          total: todayCollection[0]?.total || 0,
          count: todayCollection[0]?.count || 0,
        },
        month: {
          total: monthCollection[0]?.total || 0,
          count: monthCollection[0]?.count || 0,
        },
        pendingStudents,
      },
    });
  } catch (error) {
    console.error("Get fee summary error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFeeCollection,
  getFeeCollections,
  getFeeCollection,
  deleteFeeCollection,
  getFeeSummary,
};
