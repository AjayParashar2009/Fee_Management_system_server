const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
require("./Config/db");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
