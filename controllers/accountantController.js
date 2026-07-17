const auth_data = require("../schema/authSchema");
const Accountant = require("../schema/accountantSchema");
const bcrypt = require("bcrypt");

// @desc    Create a new accountant
// @route   POST /api/accountants
// @access  Private/Admin
const createAccountant = async (req, res) => {
  try {
    console.log("📝 Request Body:", req.body);

    const {
      name,
      email,
      phone,
      department,
      address,
      username,
      password,
      employeeId,
      joinDate,
    } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !phone || !department || !username || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Please check name, email, phone, department, username, and password.",
      });
    }

    console.log("Creating accountant:", { name, email, username, department });

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

    // Create user with accountant role
    const user = await auth_data.create({
      username: username,
      email: email,
      password: hashedPassword,
      role: "accountant",
      status: "Active",
    });

    console.log("✅ User created:", user._id);

    // Create accountant profile
    const accountant = await Accountant.create({
      user: user._id,
      name: name,
      phone: phone,
      department: department,
      address: address || "",
      employeeId: employeeId || `ACC${Date.now().toString().slice(-6)}`,
      joinDate: joinDate || new Date(),
      status: "Active",
    });

    console.log("✅ Accountant created:", accountant._id);

    // Return combined accountant data
    const accountantData = {
      _id: accountant._id,
      user: user._id,
      name: accountant.name,
      email: user.email,
      username: user.username,
      phone: accountant.phone,
      department: accountant.department,
      address: accountant.address,
      employeeId: accountant.employeeId,
      joinDate: accountant.joinDate,
      status: accountant.status,
      createdAt: accountant.createdAt,
      updatedAt: accountant.updatedAt,
    };

    return res.status(201).json({
      success: true,
      message: "Accountant created successfully",
      data: accountantData,
    });
  } catch (error) {
    console.error("❌ Create accountant error:", error);
    console.error("❌ Error details:", error.message);

    // Check for validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Check for duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all accountants
// @route   GET /api/accountants
// @access  Private/Admin
const getAccountants = async (req, res) => {
  try {
    const accountants = await Accountant.find()
      .populate("user", "username email status")
      .sort({ createdAt: -1 });

    const formattedAccountants = accountants.map((accountant) => ({
      _id: accountant._id,
      user: accountant.user?._id,
      name: accountant.name,
      email: accountant.user?.email || "N/A",
      username: accountant.user?.username || "N/A",
      phone: accountant.phone,
      department: accountant.department,
      address: accountant.address,
      employeeId: accountant.employeeId,
      joinDate: accountant.joinDate,
      status: accountant.status,
      createdAt: accountant.createdAt,
      updatedAt: accountant.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedAccountants.length,
      data: formattedAccountants,
    });
  } catch (error) {
    console.error("Get accountants error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single accountant
// @route   GET /api/accountants/:id
// @access  Private/Admin
const getAccountant = async (req, res) => {
  try {
    const accountant = await Accountant.findById(req.params.id).populate(
      "user",
      "username email status",
    );

    if (!accountant) {
      return res.status(404).json({
        success: false,
        message: "Accountant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: accountant._id,
        name: accountant.name,
        email: accountant.user?.email || "N/A",
        username: accountant.user?.username || "N/A",
        phone: accountant.phone,
        department: accountant.department,
        address: accountant.address,
        employeeId: accountant.employeeId,
        joinDate: accountant.joinDate,
        status: accountant.status,
      },
    });
  } catch (error) {
    console.error("Get accountant error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update accountant
// @route   PUT /api/accountants/:id
// @access  Private/Admin
const updateAccountant = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      address,
      username,
      password,
      employeeId,
      joinDate,
      status,
    } = req.body;

    const accountant = await Accountant.findById(req.params.id);

    if (!accountant) {
      return res.status(404).json({
        success: false,
        message: "Accountant not found",
      });
    }

    // Update accountant profile
    if (name) accountant.name = name;
    if (phone) accountant.phone = phone;
    if (department) accountant.department = department;
    if (address) accountant.address = address;
    if (employeeId) accountant.employeeId = employeeId;
    if (joinDate) accountant.joinDate = joinDate;
    if (status) accountant.status = status;

    await accountant.save();

    // Update user data if provided
    if (username || email || password) {
      const user = await auth_data.findById(accountant.user);
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

    const updatedAccountant = await Accountant.findById(req.params.id).populate(
      "user",
      "username email status",
    );

    return res.status(200).json({
      success: true,
      message: "Accountant updated successfully",
      data: {
        _id: updatedAccountant._id,
        name: updatedAccountant.name,
        email: updatedAccountant.user?.email,
        username: updatedAccountant.user?.username,
        phone: updatedAccountant.phone,
        department: updatedAccountant.department,
        address: updatedAccountant.address,
        employeeId: updatedAccountant.employeeId,
        status: updatedAccountant.status,
      },
    });
  } catch (error) {
    console.error("Update accountant error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete accountant
// @route   DELETE /api/accountants/:id
// @access  Private/Admin
const deleteAccountant = async (req, res) => {
  try {
    const accountant = await Accountant.findById(req.params.id);

    if (!accountant) {
      return res.status(404).json({
        success: false,
        message: "Accountant not found",
      });
    }

    await Accountant.findByIdAndDelete(req.params.id);
    await auth_data.findByIdAndDelete(accountant.user);

    return res.status(200).json({
      success: true,
      message: "Accountant deleted successfully",
    });
  } catch (error) {
    console.error("Delete accountant error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createAccountant,
  getAccountants,
  getAccountant,
  updateAccountant,
  deleteAccountant,
};
