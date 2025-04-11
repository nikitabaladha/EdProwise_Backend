import AdminUser from "../../models/AdminUser.js";
import saltFunction from "../../validators/saltFunction.js";
import signupValidationSchema from "../../validators/signupValidationSchema.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import AdminRegistrationEmailTemplate from "../../models/EmailTeamplates/AdminRegistrationEmailTemplate.js";

async function sendAdminRegistrationEmail(adminFullName, email, usersWithCredentials) {
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
    const emailTemplate = await AdminRegistrationEmailTemplate.findOne();
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
      <tr>  <th>Role</th>     <td>Admin</td></tr>
      <tr>  <th>Email</th>     <td>${usersWithCredentials.email}</td></tr> 
      <tr>  <th>Password</th> <td>${usersWithCredentials.password}</td></tr> 
    </table>
  `;

    // 5. Replace placeholders in email template
    const emailContent = emailTemplate.content
      .replace(/{adminName}/g, adminFullName)
      .replace(/{mailForm}/g, smtpSettings.mailFromName)
      .replace(/{Credentials}/g, credentialsHtml)
      .replace(/{app_url}/g, smtpSettings.mailHost);

    // 6. Send email
    await transporter.sendMail({
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailContent,
    });

    console.log("Registration email sent successfully");
    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending registration email:", error);
    return { hasError: true, message: "Email is not proper, we cannot send the email." };
  }
}

async function adminSignup(req, res) {
  try {
    const { error } =
      signupValidationSchema.signupValidationSchemaForAdmin.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details[0].message;
      return res.status(400).json({ message: errorMessages });
    }

    const { firstName, lastName, email, password } = req.body;

    let isExistingUser = await AdminUser.findOne({ email });

    if (isExistingUser) {
      return res
        .status(400)
        .json({ hasError: true, message: "User already exists" });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(password);

    const user = await AdminUser.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      salt,
      role: "Admin",
      status: "Completed",
    });

    const adminFullName = `${firstName} ${lastName}`;
    await sendAdminRegistrationEmail(adminFullName, email, {email, password});

    // Remove sensitive information before sending the response
    delete user.password;
    delete user.salt;

    return res.status(200).json({
      hasError: false,
      message: "Signup successfully",
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        _id: user.id,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export default adminSignup;
