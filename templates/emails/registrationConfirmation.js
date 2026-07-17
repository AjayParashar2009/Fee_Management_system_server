const registrationConfirmationTemplate = (data) => {
  const {
    name,
    email,
    username,
    password,
    role,
    course,
    semester,
    enrollmentNo,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Confirmation</title>
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
        .content {
          padding: 30px 20px;
        }
        .content h2 {
          color: #4F46E5;
          margin-top: 0;
        }
        .credentials {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .credentials table {
          width: 100%;
          border-collapse: collapse;
        }
        .credentials td {
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .credentials td:last-child {
          text-align: right;
          font-weight: 600;
        }
        .credentials .label {
          color: #6c757d;
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
        .warning {
          background: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 12px 15px;
          border-radius: 5px;
          margin: 15px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Fee Management System</h1>
          <p>Your account has been created successfully</p>
        </div>
        
        <div class="content">
          <h2>Dear ${name || "User"},</h2>
          <p>Welcome to the Fee Management System! Your account has been created successfully. Below are your login credentials:</p>
          
          <div class="credentials">
            <table>
              <tr>
                <td class="label">Username</td>
                <td><strong>${username}</strong></td>
              </tr>
              <tr>
                <td class="label">Email</td>
                <td><strong>${email}</strong></td>
              </tr>
              <tr>
                <td class="label">Password</td>
                <td><strong>${password}</strong></td>
              </tr>
              <tr>
                <td class="label">Role</td>
                <td><strong style="text-transform: capitalize;">${role}</strong></td>
              </tr>
              ${course ? `<tr><td class="label">Course</td><td><strong>${course}</strong></td></tr>` : ""}
              ${semester ? `<tr><td class="label">Semester</td><td><strong>${semester}</strong></td></tr>` : ""}
              ${enrollmentNo ? `<tr><td class="label">Enrollment No</td><td><strong>${enrollmentNo}</strong></td></tr>` : ""}
            </table>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
          </div>
          
          <p>You can access your account by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${process.env.APP_URL}/login" class="button">
              Login to Your Account
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

module.exports = registrationConfirmationTemplate;
