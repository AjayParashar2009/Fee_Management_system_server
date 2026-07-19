// controllers/feeStructureController.js
const FeeStructure = require("../schema/feeStructureSchema");

// Get all fee structures
const getFeeStructures = async (req, res) => {
  try {
    const structures = await FeeStructure.find().sort({
      course: 1,
      semester: 1,
    });
    const total = structures.length;
    const active = structures.filter((s) => s.status === "Active").length;

    res.json({
      success: true,
      count: total,
      stats: { total, active, inactive: total - active },
      data: structures,
    });
  } catch (error) {
    console.error("Get fee structures error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create fee structure
const createFeeStructure = async (req, res) => {
  try {
    const {
      course,
      semester,
      academicYear,
      tuitionFee,
      admissionFee,
      examFee,
      libraryFee,
      otherFee,
    } = req.body;

    const existing = await FeeStructure.findOne({
      course,
      semester,
      academicYear,
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Fee structure already exists" });
    }

    const totalFee =
      (tuitionFee || 0) +
      (admissionFee || 0) +
      (examFee || 0) +
      (libraryFee || 0) +
      (otherFee || 0);

    const structure = await FeeStructure.create({
      course,
      semester,
      academicYear,
      tuitionFee: tuitionFee || 0,
      admissionFee: admissionFee || 0,
      examFee: examFee || 0,
      libraryFee: libraryFee || 0,
      otherFee: otherFee || 0,
      totalFee,
      createdBy: req.userId,
      status: "Active",
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Fee structure created",
        data: structure,
      });
  } catch (error) {
    console.error("Create fee structure error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update fee structure
const updateFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);
    if (!structure) {
      return res
        .status(404)
        .json({ success: false, message: "Fee structure not found" });
    }

    const { tuitionFee, admissionFee, examFee, libraryFee, otherFee, status } =
      req.body;
    if (tuitionFee !== undefined) structure.tuitionFee = tuitionFee;
    if (admissionFee !== undefined) structure.admissionFee = admissionFee;
    if (examFee !== undefined) structure.examFee = examFee;
    if (libraryFee !== undefined) structure.libraryFee = libraryFee;
    if (otherFee !== undefined) structure.otherFee = otherFee;
    if (status) structure.status = status;

    structure.totalFee =
      structure.tuitionFee +
      structure.admissionFee +
      structure.examFee +
      structure.libraryFee +
      structure.otherFee;
    await structure.save();

    res.json({
      success: true,
      message: "Fee structure updated",
      data: structure,
    });
  } catch (error) {
    console.error("Update fee structure error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete fee structure
const deleteFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!structure) {
      return res
        .status(404)
        .json({ success: false, message: "Fee structure not found" });
    }
    res.json({ success: true, message: "Fee structure deleted" });
  } catch (error) {
    console.error("Delete fee structure error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get fee structure by course
const getFeeStructureByCourse = async (req, res) => {
  try {
    const structures = await FeeStructure.find({
      course: req.params.course,
      status: "Active",
    }).sort({ semester: 1 });
    res.json({ success: true, count: structures.length, data: structures });
  } catch (error) {
    console.error("Get fee structure by course error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeStructureByCourse,
};
