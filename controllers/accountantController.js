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

    const formattedAccountants = accountants.map((accountant) => {
      const obj = accountant.toObject();
      return {
        ...obj,
        email: accountant.user?.email || "N/A",
        username: accountant.user?.username || "N/A",
        employeeId: accountant.employeeId || "N/A",
      };
    });

    res.json({
      success: true,
      count: formattedAccountants.length,
      data: formattedAccountants,
    });
  } catch (error) {
    console.error("❌ Get accountants error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single accountant
const getAccountant = async (req, res) => {
  try {
    const accountant = await Accountant.findById(req.params.id).populate(
      "user",
      "username email status",
    );
    if (!accountant) {
      return res
        .status(404)
        .json({ success: false, message: "Accountant not found" });
    }

    const obj = accountant.toObject();
    res.json({
      success: true,
      data: {
        ...obj,
        email: accountant.user?.email || "N/A",
        username: accountant.user?.username || "N/A",
        employeeId: accountant.employeeId || "N/A",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create accountant with employee ID handling
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
      joinDate,
    } = req.body;

    // ✅ Log incoming data
    console.log("📥 Received employeeId:", employeeId);

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

    // ✅ Handle employee ID properly
    let finalEmployeeId = null;

    if (employeeId && employeeId.trim() !== "") {
      // User provided an employee ID
      finalEmployeeId = employeeId.trim();

      // Check if it already exists
      const existingEmployee = await Accountant.findOne({
        employeeId: finalEmployeeId,
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }
      console.log("✅ Using user-provided employee ID:", finalEmployeeId);
    } else {
      // Auto-generate employee ID
      const timestamp = Date.now().toString().slice(-6);
      finalEmployeeId = `ACC${timestamp}`;

      // Check if generated ID already exists (rare case)
      let existingGen = await Accountant.findOne({
        employeeId: finalEmployeeId,
      });
      let counter = 1;
      while (existingGen) {
        finalEmployeeId = `ACC${timestamp}${counter}`;
        existingGen = await Accountant.findOne({
          employeeId: finalEmployeeId,
        });
        counter++;
      }
      console.log("✅ Auto-generated employee ID:", finalEmployeeId);
    }

    // Generate password if not provided
    const generatedPassword = password || generateRandomPassword();
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

    // Create accountant profile with final employee ID
    const accountant = await Accountant.create({
      user: user._id,
      name,
      phone: phone || "",
      department: department || "Fee Collection",
      address: address || "",
      employeeId: finalEmployeeId,
      joinDate: joinDate || new Date(),
      status: "Active",
    });

    // ✅ Verify what was saved
    console.log("✅ Saved employee ID in DB:", accountant.employeeId);

    const populated = await Accountant.findById(accountant._id).populate(
      "user",
      "username email status",
    );

    res.status(201).json({
      success: true,
      message: "Accountant created successfully",
      data: {
        ...populated.toObject(),
        email: populated.user?.email || "N/A",
        username: populated.user?.username || "N/A",
        employeeId: accountant.employeeId,
      },
      credentials: {
        username: user.username,
        email: user.email,
        password: generatedPassword,
        role: "accountant",
        name: name,
        employeeId: accountant.employeeId,
      },
    });
  } catch (error) {
    console.error("❌ Create accountant error:", error);
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

    const { name, phone, department, address, status, employeeId, joinDate } =
      req.body;

    if (name) accountant.name = name;
    if (phone) accountant.phone = phone;
    if (department) accountant.department = department;
    if (address) accountant.address = address;
    if (status) accountant.status = status;
    if (joinDate) accountant.joinDate = joinDate;

    // Check if employee ID is being updated and is unique
    if (employeeId && employeeId !== accountant.employeeId) {
      const existingEmployee = await Accountant.findOne({
        employeeId,
        _id: { $ne: accountant._id },
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }
      accountant.employeeId = employeeId;
    }

    await accountant.save();

    const updated = await Accountant.findById(accountant._id).populate(
      "user",
      "username email status",
    );

    const obj = updated.toObject();
    res.json({
      success: true,
      message: "Accountant updated",
      data: {
        ...obj,
        email: updated.user?.email || "N/A",
        username: updated.user?.username || "N/A",
        employeeId: accountant.employeeId || "N/A",
      },
    });
  } catch (error) {
    console.error("❌ Update accountant error:", error);
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

    res.json({ success: true, message: "Accountant deleted successfully" });
  } catch (error) {
    console.error("❌ Delete accountant error:", error);
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

module.exports = {
  getAccountants,
  getAccountant,
  createAccountant,
  updateAccountant,
  deleteAccountant,
};
