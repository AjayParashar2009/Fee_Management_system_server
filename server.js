const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
require("./config/db");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoute = require("./routes/authRoute");
const studentRoutes = require("./routes/studentRoute");
const accountantRoutes = require("./routes/accountantRoute");
const feeCollectionRoutes = require("./routes/feeCollectionRoute");
const receiptRoutes = require("./routes/receiptRoute");
const reportRoutes = require("./routes/reportRoute");
const feeStructureRoutes = require("./routes/feeStructureRoute");

// Register routes
app.use("/api/auth", authRoute);
app.use("/api/students", studentRoutes);
app.use("/api/accountants", accountantRoutes);
app.use("/api/fee-collections", feeCollectionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/fee-structures", feeStructureRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fee Management API is running",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api/auth`);
  console.log(`📚 Students: http://localhost:${PORT}/api/students`);
  console.log(`📚 Accountants: http://localhost:${PORT}/api/accountants`);
});
