// controllers/studentController.js
const auth_data = require("../schema/authSchema");
const Student = require("../schema/studentSchema");
const bcrypt = require("bcrypt");

// ✅ Get all students - Populate user to get email
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "username email status")
      .sort({ createdAt: -1 });

    const formattedStudents = students.map((student) => {
      const studentObj = student.toObject();
      return {
        ...studentObj,
        email: student.user?.email || "N/A",
        username: student.user?.username || "N/A",
        enrollmentNo: student.enrollmentNo || "N/A",
      };
    });

    res.json({
      success: true,
      count: formattedStudents.length,
      data: formattedStudents,
    });
  } catch (error) {
    console.error("❌ Get students error:", error);
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

    const studentObj = student.toObject();
    res.json({
      success: true,
      data: {
        ...studentObj,
        email: student.user?.email || "N/A",
        username: student.user?.username || "N/A",
        enrollmentNo: student.enrollmentNo || "N/A",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create student with enrollment number handling
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
      enrollmentNo,
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

    // ✅ Check if enrollment number already exists (if provided)
    let finalEnrollmentNo = enrollmentNo?.trim();
    if (finalEnrollmentNo) {
      const existingEnrollment = await Student.findOne({
        enrollmentNo: finalEnrollmentNo,
      });
      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: "Enrollment number already exists",
        });
      }
    } else {
      // Auto-generate enrollment number
      const timestamp = Date.now().toString().slice(-6);
      finalEnrollmentNo = `STU${timestamp}`;

      // Check if generated number already exists (rare case)
      let existingGen = await Student.findOne({
        enrollmentNo: finalEnrollmentNo,
      });
      let counter = 1;
      while (existingGen) {
        finalEnrollmentNo = `STU${timestamp}${counter}`;
        existingGen = await Student.findOne({
          enrollmentNo: finalEnrollmentNo,
        });
        counter++;
      }
    }

    // Generate password if not provided
    const generatedPassword = password || generateRandomPassword();
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

    // Create student profile with final enrollment number
    const student = await Student.create({
      user: user._id,
      name,
      course,
      semester: semester || 1,
      phone: phone || "",
      address: address || "",
      dob: dob || "",
      enrollmentNo: finalEnrollmentNo,
      status: "Active",
      totalFees: 0,
      paidFees: 0,
      pendingFees: 0,
      feeStatus: "Pending",
    });

    const populated = await Student.findById(student._id).populate(
      "user",
      "username email status",
    );

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: {
        ...populated.toObject(),
        email: populated.user?.email || "N/A",
        username: populated.user?.username || "N/A",
        enrollmentNo: student.enrollmentNo,
      },
      credentials: {
        username: user.username,
        email: user.email,
        password: generatedPassword,
        role: "student",
        name: name,
        enrollmentNo: student.enrollmentNo,
      },
    });
  } catch (error) {
    console.error("❌ Create student error:", error);
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

    const {
      name,
      course,
      semester,
      phone,
      address,
      dob,
      status,
      enrollmentNo,
    } = req.body;

    if (name) student.name = name;
    if (course) student.course = course;
    if (semester) student.semester = semester;
    if (phone) student.phone = phone;
    if (address) student.address = address;
    if (dob) student.dob = dob;
    if (status) student.status = status;

    // Check if enrollment number is being updated and is unique
    if (enrollmentNo && enrollmentNo !== student.enrollmentNo) {
      const existingEnrollment = await Student.findOne({
        enrollmentNo,
        _id: { $ne: student._id },
      });
      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: "Enrollment number already exists",
        });
      }
      student.enrollmentNo = enrollmentNo;
    }

    await student.save();

    const updated = await Student.findById(student._id).populate(
      "user",
      "username email status",
    );

    const studentObj = updated.toObject();
    res.json({
      success: true,
      message: "Student updated",
      data: {
        ...studentObj,
        email: updated.user?.email || "N/A",
        username: updated.user?.username || "N/A",
        enrollmentNo: student.enrollmentNo || "N/A",
      },
    });
  } catch (error) {
    console.error("❌ Update student error:", error);
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
    console.error("❌ Delete student error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate random password
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

// Get student fees and payment history
const getStudentFees = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

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

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentFees,
};
