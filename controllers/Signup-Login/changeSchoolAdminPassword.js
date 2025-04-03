import User from "../../models/User.js";
import saltFunction from "../../validators/saltFunction.js";
import School from "../../models/School.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import passwordUpdateEmailTemplate from "../../models/EmailTeamplates/passwordUpdateEmailTemplate.js";

async function sendPasswordUpdateEmail(schoolName, schoolEmail, usersWithCredentials) {
  let hasError = false;
  let message = "";
  try {
    // 1. Get SMTP settings from database
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      console.error("SMTP settings not found");
      return false;
    }

    // 2. Get email template from database
    const emailTemplate = await passwordUpdateEmailTemplate.findOne();
    if (!emailTemplate) {
      console.error("Email template not found");
      return false;
    }

    // 3. Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.mailHost,
      port: smtpSettings.mailPort,
      secure: false, 
      auth: {
        user: smtpSettings.mailUsername,
        pass: smtpSettings.mailPassword,
      },
      tls: {
        rejectUnauthorized: false, 
      }
    });

    // 4. Prepare credentials 
    const credentialsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead><tr><th>Role</th><th>UserID</th> <th>Password</th></tr></thead>
        <tbody>
          <tr>
            <td>School</td>
            <td>${usersWithCredentials.userName}</td>
            <td>${usersWithCredentials.password}</td>
          </tr>
        </tbody>
      </table>
    `;
  //   const credentialsHtml = `
  //   <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  //     <thead>
  //       <tr>
  //         <th>Role</th>
  //         <th>UserID</th>
  //         <th>Password</th>
  //       </tr>
  //     </thead>
  //     <tbody>
  //       ${usersWithCredentials.map(user => `
  //         <tr>
  //           <td>${user.role}</td>
  //           <td>${user.userId}</td>
  //           <td>${user.password}</td>
  //         </tr>
  //       `).join('')}
  //     </tbody>
  //   </table>
  // `;
  
    // 5. Replace placeholders in email template
    const emailContent = emailTemplate.content
      .replace(/{userName}/g, usersWithCredentials.userName)
      .replace(/{companyName}/g, smtpSettings.mailFromName)
      .replace(/{mailForm}/g, smtpSettings.mailFromName)
      .replace(/{Credentials}/g, credentialsHtml)
     
    // 6. Send email
    await transporter.sendMail({
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: emailTemplate.subject,
      html: emailContent,
    });

    console.log("Password update email sent successfully");
    return { hasError: false, message: "Password update email sent successfully." };
  } catch (error) {
    console.error("Error sending password update email:", error);
    return { hasError: true, message: "Email is not proper, we cannot send the email." };
  }
}


async function changeSchoolAdminPassword(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to change the seller password.",
      });
    }


    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        hasError: true,
        message: "Both current and new passwords are required.",
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res
        .status(404)
        .json({ hasError: true, message: "User not found." });
    }

    const schoolId = user.schoolId
    const school   = await School.findOne({ schoolId });
    const schoolEmail = school.schoolEmail;
    const schoolName = school.schoolName;

    const isPasswordValid = saltFunction.validatePassword(
      currentPassword,
      user.password,
      user.salt
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ hasError: true, message: "Current password is incorrect." });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(newPassword);

    user.password = hashedPassword;
    user.salt = salt;
    await user.save();
    console.log("User new password is ",newPassword);
    
    await sendPasswordUpdateEmail(schoolName, schoolEmail, {userName:user.userId, password:newPassword});


    return res.status(200).json({
      hasError: false,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ hasError: true, message: "Server error." });
  }
}

export default changeSchoolAdminPassword;
