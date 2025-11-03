export const AccountverifiedHTML = (role) => {
  return `<html>
        <head>
          <meta http-equiv="refresh" content=2;url='${process.env.FRONTEND_URL}'" />
          <title>Account Verified</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              font-family: Arial, sans-serif;
              background-color: #f0f2f5;
            }
            .message {
              text-align: center;
              padding: 20px 40px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .message h1 {
              color: #4BB543; /* green success color */
            }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>🎉 ${role} account verified successfully!</h1>
            <p>Redirecting to login page...</p>
          </div>
        </body>
      </html>
    `;
};
//library,member account verification mail
export const getVerificationEmail = (role,verifyLink) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f8f9fa; padding: 20px;">
      <img src="https://res.cloudinary.com/ddlyq5ies/image/upload/v1760028198/image_tberhd.jpg" 
           alt="BookFlow Logo"
           style="width: 120px; height: auto; margin-bottom: 20px; border-radius: 10px;" />

      <h2 style="color: #333;">Welcome to BookFlow 📚</h2>
      <p style="font-size: 16px; color: #555;">
        Click the button below to verify your ${role} account:
      </p>
      <a href="${verifyLink}" target="_blank"
         style="display: inline-block; background: #4CAF50; color: white; 
                padding: 12px 20px; border-radius: 5px; text-decoration: none; 
                font-size: 16px; margin: 20px 0;">
        Verify Account
      </a>

      <p style="font-size: 14px; color: #777;">
        This link expires in 15 days.
      </p>
    </div>
  `;
};
//librarian verification mail
export const addLibrarianEmail = (name, username, password, verifyLink) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BookFlow Librarian Account Created</title>
    <style>
      body {
        background-color: #f4f6f8;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #2c3e50;
        color: #ffffff;
        text-align: center;
        padding: 25px 15px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 30px;
        line-height: 1.6;
      }
      .content h2 {
        color: #2c3e50;
      }
      .button {
        display: inline-block;
        margin: 25px 0;
        padding: 12px 25px;
        background-color: #007bff;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
      }
      .button:hover {
        background-color: #0056b3;
      }
      .footer {
        background-color: #f0f0f0;
        text-align: center;
        padding: 15px;
        font-size: 12px;
        color: #777;
      }
      .credentials {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        padding: 10px 15px;
        border-radius: 6px;
        margin-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to BookFlow!</h1>
      </div>
      <div class="content">
        <h2>Hello ${name},</h2>
        <p>
          Your <strong>Librarian</strong> account has been created successfully in
          <strong>BookFlow</strong>.
        </p>
        <p>Please verify your email address to activate your account(valid for 15 days).</p>

        <a href="${verifyLink}" class="button">Verify My Account</a>

        <p>Here are your login credentials:</p>

        <div class="credentials">
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>

        <p>
          This verification link will expire in 15 days.
After verification, you can change your password by simply clicking on “Forgot Password” and entering your username or email to set a new password.
If you did not request this account, please ignore this email.
        </p>

        <p>Thank you,<br/>The BookFlow Team 📚</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} BookFlow. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

export const resetPassEmail = (resetLink) => `
  <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f8f9fa; padding: 20px;">
    <img src="https://res.cloudinary.com/ddlyq5ies/image/upload/v1760028198/image_tberhd.jpg" 
         alt="BookFlow Logo"
         style="width: 120px; height: auto; margin-bottom: 20px; border-radius: 10px;" />

    <h2 style="color: #333;">Reset your BookFlow password 📚</h2>
    <p style="font-size: 16px; color: #555;">
      Click the button below to reset your password. This link is valid for 15 minutes.
    </p>

    <a href="${resetLink}" target="_blank"
       style="display: inline-block; background: #4CAF50; color: white; 
              padding: 12px 20px; border-radius: 5px; text-decoration: none; 
              font-size: 16px; margin: 20px 0;">
      Reset Password
    </a>

    <p style="font-size: 14px; color: #777;">
      If you did not request this, please ignore this email.
    </p>
  </div>`;



