// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
require("./Config/db");

// ✅ Import routes
const authRoute = require("./Routes/authRoute");
const studentRoutes = require("./Routes/studentRoute");
const accountantRoutes = require("./Routes/accountantRoute");
const feeCollectionRoutes = require("./Routes/feeCollectionRoute");
const receiptRoutes = require("./Routes/receiptRoute");
const reportRoutes = require("./Routes/reportRoute");
const feeStructureRoutes = require("./Routes/feeStructureRoute");
const paymentRoutes = require("./Routes/paymentRoute");

// Register routes
app.use("/api/auth", authRoute);
app.use("/api/students", studentRoutes);
app.use("/api/accountants", accountantRoutes);
app.use("/api/fee-collections", feeCollectionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/fee-structures", feeStructureRoutes);
app.use("/api/payments", paymentRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// In server.js - Add this temporary test route
app.get("/api/test-dashboard", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    res.json({
      success: true,
      totalStudents,
      message: "Test route working",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
});
