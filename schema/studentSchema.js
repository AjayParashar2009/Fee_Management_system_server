// schema/studentSchema.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: String, required: true },
    address: { type: String, default: "" },
    enrollmentNo: { type: String, unique: true, sparse: true },
    dob: { type: String, default: "" },
    totalFees: { type: Number, default: 0 },
    paidFees: { type: Number, default: 0 },
    pendingFees: { type: Number, default: 0 },
    feeStatus: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending",
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
