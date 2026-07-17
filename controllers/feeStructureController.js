const FeeStructure = require("../schema/feeStructureSchema");

// @desc    Create fee structure
// @route   POST /api/fee-structures
// @access  Private/Admin
const createFeeStructure = async (req, res) => {
  try {
    console.log("📝 Creating fee structure:", req.body);

    const {
      course,
      semester,
      academicYear,
      tuitionFee,
      admissionFee,
      examFee,
      libraryFee,
      otherFee,
      status,
    } = req.body;

    // Validate required fields
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course is required",
      });
    }
    if (!semester) {
      return res.status(400).json({
        success: false,
        message: "Semester is required",
      });
    }
    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: "Academic year is required",
      });
    }
    if (tuitionFee === undefined || tuitionFee === null || tuitionFee === "") {
      return res.status(400).json({
        success: false,
        message: "Tuition fee is required",
      });
    }

    // Check if fee structure already exists
    const existing = await FeeStructure.findOne({
      course,
      semester,
      academicYear,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "Fee structure already exists for this course, semester, and academic year",
      });
    }

    // ✅ Calculate total fee in controller
    const totalFee =
      (parseFloat(tuitionFee) || 0) +
      (parseFloat(admissionFee) || 0) +
      (parseFloat(examFee) || 0) +
      (parseFloat(libraryFee) || 0) +
      (parseFloat(otherFee) || 0);

    // Create fee structure
    const feeStructure = await FeeStructure.create({
      course,
      semester,
      academicYear,
      tuitionFee: parseFloat(tuitionFee) || 0,
      admissionFee: parseFloat(admissionFee) || 0,
      examFee: parseFloat(examFee) || 0,
      libraryFee: parseFloat(libraryFee) || 0,
      otherFee: parseFloat(otherFee) || 0,
      totalFee: totalFee,
      status: status || "Active",
      createdBy: req.user.id,
    });

    console.log("✅ Fee structure created:", feeStructure._id);

    return res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: feeStructure,
    });
  } catch (error) {
    console.error("❌ Create fee structure error:", error);
    console.error("❌ Error stack:", error.stack);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Fee structure already exists for this course, semester, and academic year",
      });
    }

    // Handle validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all fee structures
// @route   GET /api/fee-structures
// @access  Private/Admin
const getFeeStructures = async (req, res) => {
  try {
    const { course, academicYear, status } = req.query;

    let query = {};
    if (course) query.course = course;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    const feeStructures = await FeeStructure.find(query)
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    const totalFeeStructures = feeStructures.length;
    const activeCount = feeStructures.filter(
      (f) => f.status === "Active",
    ).length;
    const inactiveCount = feeStructures.filter(
      (f) => f.status === "Inactive",
    ).length;

    return res.status(200).json({
      success: true,
      count: totalFeeStructures,
      stats: {
        total: totalFeeStructures,
        active: activeCount,
        inactive: inactiveCount,
      },
      data: feeStructures,
    });
  } catch (error) {
    console.error("Get fee structures error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single fee structure
// @route   GET /api/fee-structures/:id
// @access  Private/Admin
const getFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id).populate(
      "createdBy",
      "username email",
    );

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: feeStructure,
    });
  } catch (error) {
    console.error("Get fee structure error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update fee structure
// @route   PUT /api/fee-structures/:id
// @access  Private/Admin
const updateFeeStructure = async (req, res) => {
  try {
    console.log("📝 Updating fee structure:", req.params.id, req.body);

    const {
      course,
      semester,
      academicYear,
      tuitionFee,
      admissionFee,
      examFee,
      libraryFee,
      otherFee,
      status,
    } = req.body;

    const feeStructure = await FeeStructure.findById(req.params.id);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    // Update fields
    if (course) feeStructure.course = course;
    if (semester) feeStructure.semester = semester;
    if (academicYear) feeStructure.academicYear = academicYear;
    if (tuitionFee !== undefined && tuitionFee !== null && tuitionFee !== "") {
      feeStructure.tuitionFee = parseFloat(tuitionFee);
    }
    if (
      admissionFee !== undefined &&
      admissionFee !== null &&
      admissionFee !== ""
    ) {
      feeStructure.admissionFee = parseFloat(admissionFee);
    }
    if (examFee !== undefined && examFee !== null && examFee !== "") {
      feeStructure.examFee = parseFloat(examFee);
    }
    if (libraryFee !== undefined && libraryFee !== null && libraryFee !== "") {
      feeStructure.libraryFee = parseFloat(libraryFee);
    }
    if (otherFee !== undefined && otherFee !== null && otherFee !== "") {
      feeStructure.otherFee = parseFloat(otherFee);
    }
    if (status) feeStructure.status = status;

    // ✅ Recalculate total in controller
    feeStructure.totalFee =
      (feeStructure.tuitionFee || 0) +
      (feeStructure.admissionFee || 0) +
      (feeStructure.examFee || 0) +
      (feeStructure.libraryFee || 0) +
      (feeStructure.otherFee || 0);

    await feeStructure.save();

    console.log("✅ Fee structure updated:", feeStructure._id);

    return res.status(200).json({
      success: true,
      message: "Fee structure updated successfully",
      data: feeStructure,
    });
  } catch (error) {
    console.error("❌ Update fee structure error:", error);
    console.error("❌ Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Delete fee structure
// @route   DELETE /api/fee-structures/:id
// @access  Private/Admin
const deleteFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    await FeeStructure.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Fee structure deleted successfully",
    });
  } catch (error) {
    console.error("Delete fee structure error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get fee structure by course
// @route   GET /api/fee-structures/course/:course
// @access  Private/Admin
const getFeeStructureByCourse = async (req, res) => {
  try {
    const { course } = req.params;
    const feeStructures = await FeeStructure.find({
      course,
      status: "Active",
    }).sort({ semester: 1 });

    return res.status(200).json({
      success: true,
      count: feeStructures.length,
      data: feeStructures,
    });
  } catch (error) {
    console.error("Get fee structure by course error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createFeeStructure,
  getFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeStructureByCourse,
};
