// Routes/studentRoute.js
const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentFees,
} = require("../controllers/studentController");
const { auth, adminOnly, accountantOnly } = require("../middleware/auth");

router.use(auth);
router.get("/", accountantOnly, getStudents);
router.get("/:id", accountantOnly, getStudent);
router.get("/:id/fees", getStudentFees);
router.post("/", adminOnly, createStudent);
router.put("/:id", adminOnly, updateStudent);
router.delete("/:id", adminOnly, deleteStudent);

module.exports = router;
