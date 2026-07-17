const cron = require("node-cron");
const Student = require("../schema/studentSchema");
const { sendFeeReminder } = require("../services/emailService");

// Run every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  console.log("🔔 Checking for fee reminders...");

  try {
    // Find students with pending fees and due date within 7 days
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    // Find students with pending fees
    const students = await Student.find({
      pendingFees: { $gt: 0 },
      feeStatus: { $ne: "Paid" },
    }).populate("user", "email");

    console.log(`📊 Found ${students.length} students with pending fees`);

    for (const student of students) {
      // Check if student has a due date (you can add a dueDate field)
      // For now, send reminder if pendingFees > 0
      if (student.user && student.user.email) {
        const daysLeft = 7; // Calculate based on actual due date
        await sendFeeReminder({
          email: student.user.email,
          studentName: student.name,
          amount: student.pendingFees,
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          course: student.course,
          semester: student.semester,
          pendingAmount: student.pendingFees,
          daysLeft: daysLeft,
        });
      }
    }

    console.log("✅ Fee reminders sent successfully");
  } catch (error) {
    console.error("❌ Error sending fee reminders:", error);
  }
});

console.log(" Fee reminder scheduler started");
