const paymentConfirmationTemplate = (data) => {
  const {
    studentName,
    receiptNo,
    amount,
    feeType,
    date,
    paymentMethod,
    transactionId,
    course,
    semester,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
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
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px 20px;
        }
        .content h2 {
          color: #4F46E5;
          margin-top: 0;
        }
        .receipt-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .receipt-details table {
          width: 100%;
          border-collapse: collapse;
        }
        .receipt-details td {
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .receipt-details td:last-child {
          text-align: right;
          font-weight: 600;
        }
        .amount {
          font-size: 24px;
          color: #10B981;
          font-weight: 700;
        }
        .status-badge {
          display: inline-block;
          background: #10B981;
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
        .logo {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏛️ Fee Management System</div>
          <h1>Payment Confirmation</h1>
          <p>Thank you for your payment</p>
        </div>
        
        <div class="content">
          <h2>Dear ${studentName || "Student"},</h2>
          <p>We are pleased to confirm that we have received your payment. Your transaction has been completed successfully.</p>
          
          <div class="receipt-details">
            <table>
              <tr>
                <td>Receipt No</td>
                <td><strong>#${receiptNo}</strong></td>
              </tr>
              <tr>
                <td>Date</td>
                <td><strong>${new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong></td>
              </tr>
              <tr>
                <td>Fee Type</td>
                <td><strong>${feeType}</strong></td>
              </tr>
              <tr>
                <td>Payment Method</td>
                <td><strong>${paymentMethod}</strong></td>
              </tr>
              <tr>
                <td>Transaction ID</td>
                <td><strong>${transactionId}</strong></td>
              </tr>
              ${course ? `<tr><td>Course</td><td><strong>${course}</strong></td></tr>` : ""}
              ${semester ? `<tr><td>Semester</td><td><strong>${semester}</strong></td></tr>` : ""}
              <tr>
                <td>Status</td>
                <td><span class="status-badge">Completed</span></td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 14px; color: #6c757d;">Amount Paid</div>
            <div class="amount">₹${amount.toLocaleString()}</div>
          </div>
          
          <p>You can view and download your receipt by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${process.env.APP_URL}/student-dashboard/receipts" class="button">
              View Receipt
            </a>
          </div>
          
          <p style="margin-top: 20px; color: #6c757d; font-size: 14px;">
            If you have any questions, please contact our support team.
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

module.exports = paymentConfirmationTemplate;
