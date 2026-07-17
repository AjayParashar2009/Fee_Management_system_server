const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    tuitionFee: {
      type: Number,
      required: [true, "Tuition fee is required"],
      min: 0,
      default: 0,
    },
    admissionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    examFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    libraryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
    },
  },
  {
    collection: "fee_structures",
    timestamps: true,
  },
);


const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);

module.exports = FeeStructure;
