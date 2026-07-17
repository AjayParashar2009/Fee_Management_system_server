const feeReminderTemplate = (data) => {
  const {
    studentName,
    amount,
    dueDate,
    course,
    semester,
    pendingAmount,
    daysLeft,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fee Reminder</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .content h2 {
          color: #DC2626;
          margin-top: 0;
        }
        .reminder-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .reminder-details table {
          width: 100%;
          border-collapse: collapse;
        }
        .reminder-details td {
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .reminder-details td:last-child {
          text-align: right;
          font-weight: 600;
        }
        .amount {
          font-size: 24px;
          color: #DC2626;
          font-weight: 700;
        }
        .days-left {
          display: inline-block;
          background: ${daysLeft <= 3 ? "#EF4444" : daysLeft <= 7 ? "#F59E0B" : "#10B981"};
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          border-top: 1px solid #e9ecef;
        }
        .button {
          display: inline-block;
          background: #4F46E5;
          color: white;
          padding: 12px 30px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 15px;
        }
        .button:hover {
          background: #4338CA;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Fee Payment Reminder</h1>
          <p>Please pay your pending fees</p>
        </div>
        
        <div class="content">
          <h2>Dear ${studentName || "Student"},</h2>
          <p>This is a friendly reminder that your fee payment is due soon. Please make sure to pay before the due date to avoid any late fees.</p>
          
          <div class="reminder-details">
            <table>
              <tr>
                <td>Pending Amount</td>
                <td><strong class="amount">₹${pendingAmount ? pendingAmount.toLocaleString() : amount.toLocaleString()}</strong></td>
              </tr>
              <tr>
                <td>Due Date</td>
                <td><strong>${new Date(dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong></td>
              </tr>
              ${course ? `<tr><td>Course</td><td><strong>${course}</strong></td></tr>` : ""}
              ${semester ? `<tr><td>Semester</td><td><strong>${semester}</strong></td></tr>` : ""}
              <tr>
                <td>Days Left</td>
                <td><span class="days-left">${daysLeft || "N/A"} days</span></td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 14px; color: #6c757d;">Amount Due</div>
            <div class="amount">₹${pendingAmount ? pendingAmount.toLocaleString() : amount.toLocaleString()}</div>
          </div>
          
          <p>Please pay your fees on time to avoid any late payment charges.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.APP_URL}/student-dashboard/fee-details" class="button">
              Pay Now
            </a>
          </div>
          
          <p style="margin-top: 20px; color: #6c757d; font-size: 14px;">
            If you have already paid, please ignore this email.
          </p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Fee Management System. All rights reserved.</p>
          <p style="font-size: 12px; margin-top: 5px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = feeReminderTemplate;
