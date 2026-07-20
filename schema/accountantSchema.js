// schema/accountantSchema.js
const mongoose = require("mongoose");

const accountantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    address: { type: String, default: "" },
    employeeId: { type: String, unique: true, sparse: true },
    joinDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Accountant", accountantSchema);
