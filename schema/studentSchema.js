const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    enrollmentNo: {
      type: String,
      unique: true,
    },
    // fatherName: {
    //   type: String,
    //   default: "",
    // },
    // motherName: {
    //   type: String,
    //   default: "",
    // },
    dob: {
      type: String,
      default: "",
    },
    totalFees: {
      type: Number,
      default: 0,
    },
    paidFees: {
      type: Number,
      default: 0,
    },
    pendingFees: {
      type: Number,
      default: 0,
    },
    feeStatus: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    collection: "students",
    timestamps: true,
  },
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
