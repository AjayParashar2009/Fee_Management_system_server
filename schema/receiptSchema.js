const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeCollection",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    feeType: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Generated", "Pending"],
      default: "Generated",
    },
    pdfUrl: {
      type: String,
      default: "",
    },
  },
  {
    collection: "receipts",
    timestamps: true,
  },
);

const Receipt = mongoose.model("Receipt", receiptSchema);

module.exports = Receipt;
