const mongoose = require("mongoose");

const FeeStructureSchema = new mongoose.Schema(
  {
    course: { type: String, required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true },
    tuitionFee: { type: Number, default: 0 },
    admissionFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    libraryFee: { type: Number, default: 0 },
    otherFee: { type: Number, default: 0 },
    totalFee: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FeeStructure", FeeStructureSchema);
