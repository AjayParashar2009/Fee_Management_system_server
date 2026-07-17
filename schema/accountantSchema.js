const mongoose = require("mongoose");

const accountantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: [
        "Fee Collection",
        "Accounts",
        "Fee Management",
        "Finance",
        "Audit",
      ],
    },
    address: {
      type: String,
      default: "",
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    collection: "accountants",
    timestamps: true,
  },
);

const Accountant = mongoose.model("Accountant", accountantSchema);

module.exports = Accountant;
