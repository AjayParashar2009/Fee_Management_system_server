const mongoose = require("mongoose");

const feeCollectionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeType: {
      type: String,
      enum: ["Tuition", "Admission", "Exam", "Library", "Other"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "UPI",
        "Credit Card",
        "Debit Card",
        "Net Banking",
        "QR Code",
      ],
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
    },
    receiptNo: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
      required: true,
    },
  },
  {
    collection: "fee_collections",
    timestamps: true,
  },
);

const FeeCollection = mongoose.model("FeeCollection", feeCollectionSchema);

module.exports = FeeCollection;
