// seedDatabase.js - FIXED VERSION
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

// Import Schemas
const auth_data = require("./schema/authSchema");
const Student = require("./schema/studentSchema");
const Accountant = require("./schema/accountantSchema");
const FeeStructure = require("./schema/feeStructureSchema");
const FeeCollection = require("./schema/feeCollectionSchema");

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://sharmaajay20090_db_user:maOx5REpByy23zaV@cluster0.1di32px.mongodb.net/?appName=Cluster0";

// ============================================
// SAMPLE DATA
// ============================================

const studentsData = [
  {
    username: "student1",
    email: "student1@college.edu",
    name: "Aarav Sharma",
    phone: "9876543210",
    course: "B.Tech",
    semester: "3rd",
    address: "123, Green Avenue, New Delhi",
    enrollmentNo: "STU001",
    dob: "2002-05-15",
    totalFees: 150000,
    paidFees: 75000,
    pendingFees: 75000,
    feeStatus: "Partial",
    status: "Active",
  },
  {
    username: "student2",
    email: "student2@college.edu",
    name: "Priya Patel",
    phone: "9876543211",
    course: "MCA",
    semester: "1st",
    address: "456, Lake View, Mumbai",
    enrollmentNo: "STU002",
    dob: "2001-08-20",
    totalFees: 120000,
    paidFees: 120000,
    pendingFees: 0,
    feeStatus: "Paid",
    status: "Active",
  },
  {
    username: "student3",
    email: "student3@college.edu",
    name: "Rahul Verma",
    phone: "9876543212",
    course: "MBA",
    semester: "2nd",
    address: "789, Park Street, Kolkata",
    enrollmentNo: "STU003",
    dob: "2000-11-10",
    totalFees: 200000,
    paidFees: 50000,
    pendingFees: 150000,
    feeStatus: "Pending",
    status: "Active",
  },
  {
    username: "student4",
    email: "student4@college.edu",
    name: "Sneha Reddy",
    phone: "9876543213",
    course: "BCA",
    semester: "5th",
    address: "101, Blue Hills, Hyderabad",
    enrollmentNo: "STU004",
    dob: "2002-03-25",
    totalFees: 80000,
    paidFees: 60000,
    pendingFees: 20000,
    feeStatus: "Partial",
    status: "Active",
  },
  {
    username: "student5",
    email: "student5@college.edu",
    name: "Vikram Singh",
    phone: "9876543214",
    course: "B.Tech",
    semester: "7th",
    address: "222, Royal Enclave, Pune",
    enrollmentNo: "STU005",
    dob: "2001-07-08",
    totalFees: 150000,
    paidFees: 150000,
    pendingFees: 0,
    feeStatus: "Paid",
    status: "Active",
  },
  {
    username: "student6",
    email: "student6@college.edu",
    name: "Neha Gupta",
    phone: "9876543215",
    course: "MCA",
    semester: "3rd",
    address: "333, Garden Colony, Chandigarh",
    enrollmentNo: "STU006",
    dob: "2002-09-12",
    totalFees: 120000,
    paidFees: 30000,
    pendingFees: 90000,
    feeStatus: "Pending",
    status: "Active",
  },
  {
    username: "student7",
    email: "student7@college.edu",
    name: "Deepak Kumar",
    phone: "9876543216",
    course: "MBA",
    semester: "4th",
    address: "444, Sunrise Apartments, Bangalore",
    enrollmentNo: "STU007",
    dob: "2000-12-01",
    totalFees: 200000,
    paidFees: 180000,
    pendingFees: 20000,
    feeStatus: "Partial",
    status: "Active",
  },
  {
    username: "student8",
    email: "student8@college.edu",
    name: "Ananya Sharma",
    phone: "9876543217",
    course: "BBA",
    semester: "2nd",
    address: "555, Green Park, Jaipur",
    enrollmentNo: "STU008",
    dob: "2003-02-18",
    totalFees: 90000,
    paidFees: 45000,
    pendingFees: 45000,
    feeStatus: "Partial",
    status: "Active",
  },
  {
    username: "student9",
    email: "student9@college.edu",
    name: "Rohan Mehta",
    phone: "9876543218",
    course: "B.Tech",
    semester: "5th",
    address: "666, Lake City, Chennai",
    enrollmentNo: "STU009",
    dob: "2001-06-22",
    totalFees: 150000,
    paidFees: 100000,
    pendingFees: 50000,
    feeStatus: "Partial",
    status: "Active",
  },
  {
    username: "student10",
    email: "student10@college.edu",
    name: "Kavya Nair",
    phone: "9876543219",
    course: "MCA",
    semester: "5th",
    address: "777, Ocean View, Kochi",
    enrollmentNo: "STU010",
    dob: "2002-10-05",
    totalFees: 120000,
    paidFees: 120000,
    pendingFees: 0,
    feeStatus: "Paid",
    status: "Active",
  },
];

const accountantsData = [
  {
    username: "accountant1",
    email: "accountant1@college.edu",
    name: "Rajesh Kumar",
    phone: "9876543220",
    department: "Fee Collection",
    address: "123, College Campus, New Delhi",
    employeeId: "ACC001",
    joinDate: new Date("2023-06-01"),
    status: "Active",
  },
  {
    username: "accountant2",
    email: "accountant2@college.edu",
    name: "Sunita Sharma",
    phone: "9876543221",
    department: "Accounts",
    address: "456, Staff Quarters, New Delhi",
    employeeId: "ACC002",
    joinDate: new Date("2023-08-15"),
    status: "Active",
  },
  {
    username: "accountant3",
    email: "accountant3@college.edu",
    name: "Amit Singh",
    phone: "9876543222",
    department: "Finance",
    address: "789, Teachers Colony, New Delhi",
    employeeId: "ACC003",
    joinDate: new Date("2024-01-10"),
    status: "Active",
  },
];

// ✅ FIXED: Use numbers for semester (not strings)
const feeStructuresData = [
  {
    course: "B.Tech",
    semester: 1,
    tuitionFee: 50000,
    admissionFee: 10000,
    examFee: 5000,
    libraryFee: 2000,
    otherFee: 3000,
  },
  {
    course: "B.Tech",
    semester: 2,
    tuitionFee: 50000,
    admissionFee: 0,
    examFee: 5000,
    libraryFee: 2000,
    otherFee: 3000,
  },
  {
    course: "B.Tech",
    semester: 3,
    tuitionFee: 50000,
    admissionFee: 0,
    examFee: 5000,
    libraryFee: 2000,
    otherFee: 3000,
  },
  {
    course: "B.Tech",
    semester: 4,
    tuitionFee: 50000,
    admissionFee: 0,
    examFee: 5000,
    libraryFee: 2000,
    otherFee: 3000,
  },
  {
    course: "MCA",
    semester: 1,
    tuitionFee: 60000,
    admissionFee: 12000,
    examFee: 6000,
    libraryFee: 2500,
    otherFee: 4000,
  },
  {
    course: "MCA",
    semester: 2,
    tuitionFee: 60000,
    admissionFee: 0,
    examFee: 6000,
    libraryFee: 2500,
    otherFee: 4000,
  },
  {
    course: "MBA",
    semester: 1,
    tuitionFee: 100000,
    admissionFee: 20000,
    examFee: 8000,
    libraryFee: 4000,
    otherFee: 5000,
  },
  {
    course: "MBA",
    semester: 2,
    tuitionFee: 100000,
    admissionFee: 0,
    examFee: 8000,
    libraryFee: 4000,
    otherFee: 5000,
  },
  {
    course: "BCA",
    semester: 1,
    tuitionFee: 35000,
    admissionFee: 8000,
    examFee: 4000,
    libraryFee: 1500,
    otherFee: 2000,
  },
  {
    course: "BCA",
    semester: 2,
    tuitionFee: 35000,
    admissionFee: 0,
    examFee: 4000,
    libraryFee: 1500,
    otherFee: 2000,
  },
  {
    course: "BBA",
    semester: 1,
    tuitionFee: 45000,
    admissionFee: 10000,
    examFee: 5000,
    libraryFee: 2000,
    otherFee: 3000,
  },
  {
    course: "BBA",
    semester: 2,
    tuitionFee: 45000,
    admissionFee: 0,
    examFee: 5000,
    libraryFee: 2000,
    otherFee: 3000,
  },
];

const feeCollectionsData = [
  {
    studentIndex: 0,
    feeType: "Tuition",
    amount: 25000,
    paymentMethod: "Cash",
    note: "First installment",
  },
  {
    studentIndex: 0,
    feeType: "Admission",
    amount: 10000,
    paymentMethod: "UPI",
    note: "Admission fee",
  },
  {
    studentIndex: 1,
    feeType: "Tuition",
    amount: 60000,
    paymentMethod: "Card",
    note: "Full semester fee",
  },
  {
    studentIndex: 1,
    feeType: "Admission",
    amount: 12000,
    paymentMethod: "Online",
    note: "Admission fee",
  },
  {
    studentIndex: 2,
    feeType: "Tuition",
    amount: 50000,
    paymentMethod: "Cash",
    note: "Partial payment",
  },
  {
    studentIndex: 3,
    feeType: "Library",
    amount: 2000,
    paymentMethod: "UPI",
    note: "Library fee",
  },
  {
    studentIndex: 3,
    feeType: "Exam",
    amount: 4000,
    paymentMethod: "Card",
    note: "Exam fee",
  },
  {
    studentIndex: 4,
    feeType: "Tuition",
    amount: 50000,
    paymentMethod: "Online",
    note: "Tuition fee",
  },
  {
    studentIndex: 4,
    feeType: "Library",
    amount: 2000,
    paymentMethod: "Cash",
    note: "Library fee",
  },
  {
    studentIndex: 5,
    feeType: "Tuition",
    amount: 30000,
    paymentMethod: "UPI",
    note: "First installment",
  },
  {
    studentIndex: 6,
    feeType: "Tuition",
    amount: 100000,
    paymentMethod: "Card",
    note: "Tuition fee",
  },
  {
    studentIndex: 7,
    feeType: "Admission",
    amount: 10000,
    paymentMethod: "Cash",
    note: "Admission fee",
  },
  {
    studentIndex: 8,
    feeType: "Exam",
    amount: 5000,
    paymentMethod: "Online",
    note: "Exam fee",
  },
  {
    studentIndex: 9,
    feeType: "Tuition",
    amount: 60000,
    paymentMethod: "UPI",
    note: "Full payment",
  },
];

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // 1. Clear existing data
    console.log("🗑️ Clearing existing data...");
    await auth_data.deleteMany({});
    await Student.deleteMany({});
    await Accountant.deleteMany({});
    await FeeStructure.deleteMany({});
    await FeeCollection.deleteMany({});
    console.log("✅ Cleared existing data\n");

    // 2. Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);
    const accountantPassword = await bcrypt.hash("accountant123", 10);

    // 3. Create Admin
    console.log("👤 Creating Admin...");
    const admin = await auth_data.create({
      username: "admin",
      email: "admin@college.edu",
      password: adminPassword,
      role: "admin",
      status: "Active",
      name: "Admin User",
    });
    console.log(`✅ Admin created: admin / admin123\n`);

    // 4. Create Students
    console.log("👨‍🎓 Creating Students...");
    const studentUsers = [];
    const studentProfiles = [];

    for (const data of studentsData) {
      const user = await auth_data.create({
        username: data.username,
        email: data.email,
        password: studentPassword,
        role: "student",
        status: "Active",
        name: data.name,
      });
      studentUsers.push(user);

      const profile = await Student.create({
        user: user._id,
        name: data.name,
        phone: data.phone,
        course: data.course,
        semester: data.semester,
        address: data.address,
        enrollmentNo: data.enrollmentNo,
        dob: data.dob,
        totalFees: data.totalFees,
        paidFees: data.paidFees,
        pendingFees: data.pendingFees,
        feeStatus: data.feeStatus,
        status: data.status,
      });
      studentProfiles.push(profile);
    }
    console.log(`✅ Created ${studentProfiles.length} students\n`);

    // 5. Create Accountants
    console.log("👤 Creating Accountants...");
    const accountantUsers = [];
    const accountantProfiles = [];

    for (const data of accountantsData) {
      const user = await auth_data.create({
        username: data.username,
        email: data.email,
        password: accountantPassword,
        role: "accountant",
        status: "Active",
        name: data.name,
      });
      accountantUsers.push(user);

      const profile = await Accountant.create({
        user: user._id,
        name: data.name,
        phone: data.phone,
        department: data.department,
        address: data.address,
        employeeId: data.employeeId,
        joinDate: data.joinDate,
        status: data.status,
      });
      accountantProfiles.push(profile);
    }
    console.log(`✅ Created ${accountantProfiles.length} accountants\n`);

    // 6. Create Fee Structures
    console.log("📊 Creating Fee Structures...");
    const feeStructures = [];

    for (const data of feeStructuresData) {
      const totalFee =
        data.tuitionFee +
        data.admissionFee +
        data.examFee +
        data.libraryFee +
        data.otherFee;
      const structure = await FeeStructure.create({
        course: data.course,
        semester: data.semester,
        academicYear: "2024-25",
        tuitionFee: data.tuitionFee,
        admissionFee: data.admissionFee,
        examFee: data.examFee,
        libraryFee: data.libraryFee,
        otherFee: data.otherFee,
        totalFee: totalFee,
        status: "Active",
        createdBy: admin._id,
      });
      feeStructures.push(structure);
    }
    console.log(`✅ Created ${feeStructures.length} fee structures\n`);

    // 7. Create Fee Collections
    console.log("💰 Creating Fee Collections...");

    for (const data of feeCollectionsData) {
      const student = studentProfiles[data.studentIndex];
      const accountant = accountantProfiles[0]; // Use first accountant

      if (student) {
        const receiptNo = `RCPT${Date.now().toString().slice(-6)}`;
        const transactionId = `TXN${Date.now()}`;

        await FeeCollection.create({
          student: student._id,
          feeType: data.feeType,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          transactionId: transactionId,
          receiptNo: receiptNo,
          status: "Completed",
          date: new Date(),
          note: data.note || "",
          collectedBy: accountant._id,
        });
      }
    }
    console.log(`✅ Created ${feeCollectionsData.length} fee collections\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log("=".repeat(50));
    console.log("🎉 DATABASE SEEDING COMPLETE!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`   👤 Admin: 1`);
    console.log(`   👨‍🎓 Students: ${studentProfiles.length}`);
    console.log(`   👤 Accountants: ${accountantProfiles.length}`);
    console.log(`   📊 Fee Structures: ${feeStructures.length}`);
    console.log(`   💰 Fee Collections: ${feeCollectionsData.length}`);

    console.log("\n🔑 Login Credentials:");
    console.log("   ─────────────────────────────");
    console.log("   Admin:");
    console.log("     Username: admin");
    console.log("     Password: admin123");
    console.log("   ─────────────────────────────");
    console.log("   Accountants:");
    console.log("     Username: accountant1");
    console.log("     Password: accountant123");
    console.log("   ─────────────────────────────");
    console.log("   Students:");
    console.log("     Username: student1 - student10");
    console.log("     Password: student123");
    console.log("   ─────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    console.error("❌ Error details:", error.message);
    if (error.errors) {
      console.error("❌ Validation errors:", error.errors);
    }
    process.exit(1);
  }
};

// Run the seed
seedDatabase();
