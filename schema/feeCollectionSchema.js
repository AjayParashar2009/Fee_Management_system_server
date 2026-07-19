// schema/feeCollectionSchema.js
const mongoose = require("mongoose");

const feeCollectionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeType: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, unique: true },
    receiptNo: { type: String, unique: true },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },
    date: { type: Date, default: Date.now },
    note: { type: String, default: "" },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FeeCollection", feeCollectionSchema);
