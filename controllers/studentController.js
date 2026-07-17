const auth_data = require("../schema/authSchema");
const Student = require("../schema/studentSchema");
const bcrypt = require("bcrypt");
const { sendRegistrationConfirmation } = require("../services/emailService");

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      course,
      semester,
      address,
      username,
      password,
      enrollmentNo,
      dob,
    } = req.body;

    console.log("Creating student:", { name, email, username });

    // Check if user already exists
    const existingUser = await auth_data.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with student role
    const user = await auth_data.create({
      username: username || email.split("@")[0],
      email,
      password: hashedPassword,
      role: "student",
      status: "Active",
    });

    // Create student profile
    const student = await Student.create({
      user: user._id,
      name: name,
      phone: phone,
      course: course,
      semester: semester,
      address: address || "",
      enrollmentNo: enrollmentNo || `STU${Date.now().toString().slice(-6)}`,
      dob: dob || "",
      status: "Active",
      totalFees: 0,
      paidFees: 0,
      pendingFees: 0,
      feeStatus: "Pending",
    });

    // ✅ Send registration confirmation email
    try {
      await sendRegistrationConfirmation({
        email: user.email,
        name: student.name,
        username: user.username,
        password: password, // This is the plain password from request
        role: "student",
        course: student.course,
        semester: student.semester,
        enrollmentNo: student.enrollmentNo,
      });
      console.log(`✅ Registration confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error("⚠️ Registration email not sent:", emailError.message);
      // Don't fail the registration if email fails
    }

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error("Create student error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    // Find all student profiles and populate user data
    const students = await Student.find()
      .populate("user", "username email status")
      .sort({ createdAt: -1 });

    // Format the response
    const formattedStudents = students.map((student) => ({
      _id: student._id,
      user: student.user?._id,
      name: student.name,
      email: student.user?.email || "N/A",
      username: student.user?.username || "N/A",
      phone: student.phone,
      course: student.course,
      semester: student.semester,
      address: student.address,
      enrollmentNo: student.enrollmentNo,
      dob: student.dob,
      status: student.status,
      feeStatus: student.feeStatus,
      totalFees: student.totalFees,
      paidFees: student.paidFees,
      pendingFees: student.pendingFees,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedStudents.length,
      data: formattedStudents,
    });
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "user",
      "username email status",
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const studentData = {
      _id: student._id,
      user: student.user?._id,
      name: student.name,
      email: student.user?.email || "N/A",
      username: student.user?.username || "N/A",
      phone: student.phone,
      course: student.course,
      semester: student.semester,
      address: student.address,
      enrollmentNo: student.enrollmentNo,
      dob: student.dob,
      status: student.status,
      feeStatus: student.feeStatus,
      totalFees: student.totalFees,
      paidFees: student.paidFees,
      pendingFees: student.pendingFees,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    return res.status(200).json({
      success: true,
      data: studentData,
    });
  } catch (error) {
    console.error("Get student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      course,
      semester,
      address,
      username,
      password,
      dob,
      status,
    } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Update student profile
    if (name) student.name = name;
    if (phone) student.phone = phone;
    if (course) student.course = course;
    if (semester) student.semester = semester;
    if (address) student.address = address;
    if (dob) student.dob = dob;
    if (status) student.status = status;

    await student.save();

    // Update user data if provided
    if (username || email || password) {
      const user = await auth_data.findById(student.user);
      if (user) {
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
      }
    }

    // Get updated student with user data
    const updatedStudent = await Student.findById(req.params.id).populate(
      "user",
      "username email status",
    );

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: {
        _id: updatedStudent._id,
        name: updatedStudent.name,
        email: updatedStudent.user?.email,
        username: updatedStudent.user?.username,
        phone: updatedStudent.phone,
        course: updatedStudent.course,
        semester: updatedStudent.semester,
        address: updatedStudent.address,
        enrollmentNo: updatedStudent.enrollmentNo,
        status: updatedStudent.status,
      },
    });
  } catch (error) {
    console.error("Update student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Delete student profile and user
    await Student.findByIdAndDelete(req.params.id);
    await auth_data.findByIdAndDelete(student.user);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
};
