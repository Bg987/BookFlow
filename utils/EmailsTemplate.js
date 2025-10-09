// utils/emailTemplates.js

export const getVerificationEmail = (verifyLink) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f8f9fa; padding: 20px;">
      <img src="https://res.cloudinary.com/ddlyq5ies/image/upload/v1760028198/image_tberhd.jpg" 
           alt="BookFlow Logo"
           style="width: 120px; height: auto; margin-bottom: 20px; border-radius: 10px;" />

      <h2 style="color: #333;">Welcome to BookFlow 📚</h2>
      <p style="font-size: 16px; color: #555;">
        Click the button below to verify your account:
      </p>

      <a href="${verifyLink}" target="_blank"
         style="display: inline-block; background: #4CAF50; color: white; 
                padding: 12px 20px; border-radius: 5px; text-decoration: none; 
                font-size: 16px; margin: 20px 0;">
        Verify Account
      </a>

      <p style="font-size: 14px; color: #777;">
        This link expires in 15 minutes.
      </p>
    </div>
  `;
};
export const resetPassEmail =(resetLink)=> `
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
  </div>
`;

