import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import SellerProfile from "../../models/SellerProfile.js";
import School from "../../models/School.js";
import User from "../../models/User.js";
import Seller from "../../models/Seller.js";
import saltFunction from "../../validators/saltFunction.js";
import passwordUpdateEmailTemplate from "../../models/EmailTeamplates/passwordUpdateEmailTemplate.js";

const sendPasswordUpdateEmail = async (companyName, email, usersWithCredentials, role) => {
  try {
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) return { hasError: true, message: "SMTP settings not found." };

    const emailTemplate = await passwordUpdateEmailTemplate.findOne();
    if (!emailTemplate) return { hasError: true, message: "Email template not found." };

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

    const credentialsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead><tr><th>Role</th><th>UserID</th><th>Password</th></tr></thead>
        <tbody>
          <tr>
            <td>${role}</td>
            <td>${usersWithCredentials.userName}</td>
            <td>${usersWithCredentials.password}</td>
          </tr>
        </tbody>
      </table>
    `;

    const emailContent = emailTemplate.content
      .replace(/{userName}/g, usersWithCredentials.userName)
      .replace(/{companyName}/g, companyName)
      .replace(/{mailForm}/g, smtpSettings.mailFromName)
      .replace(/{Credentials}/g, credentialsHtml);

    await transporter.sendMail({
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailContent,
    });

    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending password update email:", error);
    return { hasError: true, message: "Failed to send email." };
  }
};

const resetUserOrSellerPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        hasError: true,
        message: "userId and newPassword are required.",
      });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(newPassword);

    // Try school user
    let user = await User.findOne({ userId });
    if (user) {
      user.password = hashedPassword;
      user.salt = salt;
      await user.save();

      const school = await School.findOne({ schoolId: user.schoolId });
      if (school) {
        await sendPasswordUpdateEmail(
          school.schoolName,
          school.schoolEmail,
          { userName: user.userId, password: newPassword },
          "School"
        );
      }

      return res.status(200).json({
        hasError: false,
        message: "Password updated for school user.",
      });
    }

    // Try seller
    let seller = await Seller.findOne({ userId });
    if (seller) {
      seller.password = hashedPassword;
      seller.salt = salt;
      await seller.save();

      const sellerProfile = await SellerProfile.findOne({ sellerId: seller._id });
      if (sellerProfile) {
        await sendPasswordUpdateEmail(
          sellerProfile.companyName,
          sellerProfile.emailId,
          { userName: seller.userId, password: newPassword },
          "Seller"
        );
      }

      return res.status(200).json({
        hasError: false,
        message: "Password updated for seller.",
      });
    }

    return res.status(404).json({
      hasError: true,
      message: "User ID not found in User or Seller collections.",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);
    return res.status(500).json({ hasError: true, message: "Server error." });
  }
};

export default resetUserOrSellerPassword;
