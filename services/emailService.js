const { sendEmail } = require("../Config/email");
const paymentConfirmationTemplate = require("../templates/emails/paymentConfirmation");
const feeReminderTemplate = require("../templates/emails/feeRemainder");
const registrationConfirmationTemplate = require("../templates/emails/registrationConfirmation");

// Send payment confirmation email
const sendPaymentConfirmation = async (data) => {
  try {
    const { email, studentName } = data;
    const subject = `Payment Confirmation - Receipt #${data.receiptNo}`;
    const html = paymentConfirmationTemplate(data);

    await sendEmail(email, subject, html);
    console.log(`✅ Payment confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending payment confirmation:", error);
    return false;
  }
};

// Send fee reminder email
const sendFeeReminder = async (data) => {
  try {
    const { email, studentName } = data;
    const subject = `⏰ Fee Reminder - Payment Due Soon`;
    const html = feeReminderTemplate(data);

    await sendEmail(email, subject, html);
    console.log(`✅ Fee reminder sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending fee reminder:", error);
    return false;
  }
};

// Send registration confirmation email
const sendRegistrationConfirmation = async (data) => {
  try {
    const { email, name } = data;
    const subject = `🎉 Welcome to Fee Management System`;
    const html = registrationConfirmationTemplate(data);

    await sendEmail(email, subject, html);
    console.log(`✅ Registration confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending registration confirmation:", error);
    return false;
  }
};

module.exports = {
  sendPaymentConfirmation,
  sendFeeReminder,
  sendRegistrationConfirmation,
};
