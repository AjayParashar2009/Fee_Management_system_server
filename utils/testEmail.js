const dotenv = require("dotenv");
dotenv.config();

const { sendEmail } = require("../Config/email");

const testEmail = async () => {
  try {
    await sendEmail(
      "sharmaajay20090@gmail.com",
      "Test Email from Fee Management System",
      `
      <h1>✅ Email is Working!</h1>
      <p>This is a test email to verify that the email configuration is working correctly.</p>
      <p>Your Fee Management System is ready to send notifications.</p>
      `,
    );
    console.log("✅ Test email sent successfully!");
  } catch (error) {
    console.error("❌ Test email failed:", error);
  }
};

testEmail();
