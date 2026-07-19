// controllers/studentController.js
const auth_data = require("../schema/authSchema");
const Student = require("../schema/studentSchema");
const bcrypt = require("bcrypt");

// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "username email status")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single student
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "user",
      "username email status",
    );
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create student with auto-generated credentials
const createStudent = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      course,
      semester,
      phone,
      address,
      dob,
    } = req.body;

    // Check if user exists
    const existing = await auth_data.findOne({
      $or: [{ email }, { username }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // ✅ Generate password if not provided
    const generatedPassword = password || generateRandomPassword();

    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create auth user
    const user = await auth_data.create({
      username: username || email.split("@")[0],
      email,
      password: hashedPassword,
      role: "student",
      status: "Active",
      name: name,
    });

    // Create student profile
    const student = await Student.create({
      user: user._id,
      name,
      course,
      semester: semester || 1,
      phone: phone || "",
      address: address || "",
      dob: dob || "",
      enrollmentNo: `STU${Date.now().toString().slice(-6)}`,
      status: "Active",
    });

    const populated = await Student.findById(student._id).populate(
      "user",
      "username email status",
    );

    // ✅ Return credentials so frontend can display them
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: populated,
      credentials: {
        username: user.username,
        email: user.email,
        password: generatedPassword,
        role: "student",
        name: name,
      },
    });
  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const { name, course, semester, phone, address, dob, status } = req.body;
    if (name) student.name = name;
    if (course) student.course = course;
    if (semester) student.semester = semester;
    if (phone) student.phone = phone;
    if (address) student.address = address;
    if (dob) student.dob = dob;
    if (status) student.status = status;
    await student.save();

    const updated = await Student.findById(student._id).populate(
      "user",
      "username email status",
    );
    res.json({ success: true, message: "Student updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    await Student.findByIdAndDelete(req.params.id);
    await auth_data.findByIdAndDelete(student.user);

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Helper function to generate random password
const generateRandomPassword = () => {
  const length = 10;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// controllers/studentController.js - Add this function

// ✅ Get student fees and payment history
const getStudentFees = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Get fee collections for this student
    const FeeCollection = require("../schema/feeCollectionSchema");
    const collections = await FeeCollection.find({ student: student._id }).sort(
      { date: -1 },
    );

    res.json({
      success: true,
      data: {
        student: student,
        collections: collections,
        summary: {
          totalFees: student.totalFees || 0,
          paidFees: student.paidFees || 0,
          pendingFees: student.pendingFees || 0,
          feeStatus: student.feeStatus || "Pending",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export it
module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentFees, 
};
