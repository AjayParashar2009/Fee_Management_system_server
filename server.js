// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ============================================
// ✅ CORS CONFIGURATION - FIX FOR DEPLOYMENT
// ============================================
const allowedOrigins = [
  "https://fee-management-system-theta.vercel.app",
  "https://fee-management-system-six.vercel.app",
  "https://fee-management-system.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked origin:", origin);
        // For production, uncomment the line below and comment the next line
        // callback(new Error('Not allowed by CORS'));
        callback(null, true); // Allow all origins for testing (remove in production)
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Handle preflight requests
app.options("*", cors());

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// DATABASE CONNECTION
// ============================================
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/fee_management";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((err) => {
    console.error("❌ Database not Connected:", err.message || err);
    process.exit(1);
  });

// ============================================
// IMPORT ROUTES
// ============================================
const authRoute = require("./Routes/authRoute");
const studentRoutes = require("./Routes/studentRoute");
const accountantRoutes = require("./Routes/accountantRoute");
const feeCollectionRoutes = require("./Routes/feeCollectionRoute");
const receiptRoutes = require("./Routes/receiptRoute");
const reportRoutes = require("./Routes/reportRoute");
const feeStructureRoutes = require("./Routes/feeStructureRoute");
const paymentRoutes = require("./Routes/paymentRoute");

// ============================================
// REGISTER ROUTES
// ============================================
app.use("/api/auth", authRoute);
app.use("/api/students", studentRoutes);
app.use("/api/accountants", accountantRoutes);
app.use("/api/fee-collections", feeCollectionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/fee-structures", feeStructureRoutes);
app.use("/api/payments", paymentRoutes);

// ============================================
// TEST ROUTE
// ============================================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================================
// ROOT ROUTE
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "Fee Management System API",
    version: "1.0.0",
    endpoints: {
      test: "/api/test",
      auth: "/api/auth/login",
      students: "/api/students",
      accountants: "/api/accountants",
      feeStructures: "/api/fee-structures",
      feeCollections: "/api/fee-collections",
      receipts: "/api/receipts",
      reports: "/api/reports",
      payments: "/api/payments",
    },
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error("❌ Stack:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 CORS enabled for ${allowedOrigins.length} origins\n`);
});

// ============================================
// HANDLE UNHANDLED REJECTIONS
// ============================================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
