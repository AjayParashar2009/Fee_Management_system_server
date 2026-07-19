// controllers/accountantController.js
const auth_data = require("../schema/authSchema");
const Accountant = require("../schema/accountantSchema");
const bcrypt = require("bcrypt");

// Get all accountants
const getAccountants = async (req, res) => {
  try {
    const accountants = await Accountant.find()
      .populate("user", "username email status")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: accountants.length, data: accountants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create accountant with auto-generated credentials
const createAccountant = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      phone,
      department,
      address,
      employeeId,
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
      role: "accountant",
      status: "Active",
      name: name,
    });

    // Create accountant profile
    const accountant = await Accountant.create({
      user: user._id,
      name,
      phone: phone || "",
      department: department || "Fee Collection",
      address: address || "",
      employeeId: employeeId || `ACC${Date.now().toString().slice(-6)}`,
      status: "Active",
      joinDate: new Date(),
    });

    const populated = await Accountant.findById(accountant._id).populate(
      "user",
      "username email status",
    );

    // ✅ Return credentials so frontend can display them
    res.status(201).json({
      success: true,
      message: "Accountant created successfully",
      data: populated,
      credentials: {
        username: user.username,
        email: user.email,
        password: generatedPassword,
        role: "accountant",
        name: name,
      },
    });
  } catch (error) {
    console.error("Create accountant error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update accountant
const updateAccountant = async (req, res) => {
  try {
    const accountant = await Accountant.findById(req.params.id);
    if (!accountant) {
      return res
        .status(404)
        .json({ success: false, message: "Accountant not found" });
    }

    const { name, phone, department, address, status } = req.body;
    if (name) accountant.name = name;
    if (phone) accountant.phone = phone;
    if (department) accountant.department = department;
    if (address) accountant.address = address;
    if (status) accountant.status = status;
    await accountant.save();

    const updated = await Accountant.findById(accountant._id).populate(
      "user",
      "username email status",
    );
    res.json({ success: true, message: "Accountant updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete accountant
const deleteAccountant = async (req, res) => {
  try {
    const accountant = await Accountant.findById(req.params.id);
    if (!accountant) {
      return res
        .status(404)
        .json({ success: false, message: "Accountant not found" });
    }

    await Accountant.findByIdAndDelete(req.params.id);
    await auth_data.findByIdAndDelete(accountant.user);

    res.json({ success: true, message: "Accountant deleted" });
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

module.exports = {
  getAccountants,
  createAccountant,
  updateAccountant,
  deleteAccountant,
};
