import Seller from "../../models/Seller.js";
import saltFunction from "../../validators/saltFunction.js";

import SellerProfile from "../../models/SellerProfile.js";
import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import passwordUpdateEmailTemplate from "../../models/EmailTeamplates/passwordUpdateEmailTemplate.js";

async function sendPasswordUpdateEmail(
  sellerCompanyName,
  sellerEmail,
  usersWithCredentials
) {
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
      },
    });

    // 4. Prepare credentials
    const credentialsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead><tr><th>Role</th><th>UserID</th> <th>Password</th></tr></thead>
        <tbody>
          <tr>
            <td>Seller</td>
            <td>${usersWithCredentials.userName}</td>
            <td>${usersWithCredentials.password}</td>
          </tr>
        </tbody>
      </table>
    `;

    // 5. Replace placeholders in email template
    const emailContent = emailTemplate.content
      .replace(/{userName}/g, usersWithCredentials.userName)
      .replace(/{companyName}/g, smtpSettings.mailFromName)
      .replace(/{mailForm}/g, smtpSettings.mailFromName)
      .replace(/{Credentials}/g, credentialsHtml);

    // 6. Send email
    await transporter.sendMail({
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: sellerEmail,
      subject: emailTemplate.subject,
      html: emailContent,
    });

    console.log("Password update email sent successfully");
    return {
      hasError: false,
      message: "Password update email sent successfully.",
    };
  } catch (error) {
    console.error("Error sending password update email:", error);
    return {
      hasError: true,
      message: "Email is not proper, we cannot send the email.",
    };
  }
}

async function changeSellerPassword(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to change the seller password.",
      });
    }

    const sellerProfileDetails = await SellerProfile.findOne({ sellerId });

    const sellerCompanyName = sellerProfileDetails.companyName;

    const sellerEmail = sellerProfileDetails.emailId;

    console.log("Seller Email:", sellerEmail);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        hasError: true,
        message: "Both current and new passwords are required.",
      });
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res
        .status(404)
        .json({ hasError: true, message: "Seller not found." });
    }

    const isPasswordValid = saltFunction.validatePassword(
      currentPassword,
      seller.password,
      seller.salt
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ hasError: true, message: "Current password is incorrect." });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(newPassword);

    seller.password = hashedPassword;
    seller.salt = salt;
    await seller.save();

    await sendPasswordUpdateEmail(sellerCompanyName, sellerEmail, {
      userName: seller.userId,
      password: newPassword,
    });

    return res.status(200).json({
      hasError: false,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ hasError: true, message: "Server error." });
  }
}

export default changeSellerPassword;
