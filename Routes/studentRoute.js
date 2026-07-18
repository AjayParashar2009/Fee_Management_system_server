const express = require("express");
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { verifyToken, isAdmin, accountant } = require("../Middleware/auth");

// All routes require authentication
router.use(verifyToken);

// Public (for all authenticated users) - Accountant can view students
router.get("/", accountant, getStudents);
router.get("/:id", accountant, getStudent);

// Admin only routes
router.post("/", isAdmin, createStudent);
router.put("/:id", isAdmin, updateStudent);
router.delete("/:id", isAdmin, deleteStudent);

module.exports = router;
