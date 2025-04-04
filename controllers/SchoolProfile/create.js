import SchoolRegistration from "../../models/School.js";
import SchoolRegistrationValidator from "../../validators/AdminUser/SchoolRegistrationValidator.js";
import User from "../../models/User.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import SignUpEmailTemplate from "../../models/SignUpEmailTemplate.js";

async function sendSchoolRegistrationEmail(
  schoolName,
  schoolEmail,
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
    const emailTemplate = await SignUpEmailTemplate.findOne();
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
        <thead><tr><th>Role</th><th>UserID</th></tr></thead>
        <tbody>
          <tr>
            <td>School</td>
            <td>${usersWithCredentials.userId}</td>
          </tr>
        </tbody>
      </table>
    `;

    // 5. Replace placeholders in email template
    const emailContent = emailTemplate.content
      .replace(/{SchoolName}/g, schoolName)
      .replace(/{mailForm}/g, smtpSettings.mailFromName)
      .replace(/{Credentials}/g, credentialsHtml)
      .replace(/{app_url}/g, smtpSettings.mailHost);

    // 6. Send email
    await transporter.sendMail({
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: emailTemplate.subject,
      html: emailContent,
    });

    console.log("Registration email sent successfully");
    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending registration email:", error);
    return {
      hasError: true,
      message: "Email is not proper, we cannot send the email.",
    };
  }
}

async function create(req, res) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const { error } =
      SchoolRegistrationValidator.SchoolProfileCreateByUserValidator.validate(
        req.body
      );
    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const {
      schoolName,
      schoolMobileNo,
      schoolEmail,
      affiliationUpto,
      panNo,
      schoolAddress,
      schoolLocation,
      landMark,
      schoolPincode,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
    } = req.body;

    const { affiliationCertificate, panFile, profileImage } = req.files || {};

    if (!affiliationCertificate?.[0]) {
      return res.status(400).json({
        hasError: true,
        message: "Affiliation Certificate is required.",
      });
    }

    if (!panFile?.[0]) {
      return res.status(400).json({
        hasError: true,
        message: "PAN File is required.",
      });
    }

    const profileImagePath =
      profileImage && profileImage[0]
        ? `/Images/SchoolProfile/${profileImage[0].filename}`
        : "/Images/DummyImages/Dummy_Profile.png";

    const affiliationCertificatePath =
      affiliationCertificate[0].mimetype.startsWith("image/")
        ? `/Images/SchoolAffiliationCertificate/${affiliationCertificate[0].filename}`
        : `/Documents/SchoolAffiliationCertificate/${affiliationCertificate[0].filename}`;
    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? `/Images/SchoolPanFile/${panFile[0].filename}`
      : `/Documents/SchoolPanFile/${panFile[0].filename}`;

    const newSchoolRegistration = new SchoolRegistration({
      schoolId,
      schoolName,
      schoolMobileNo,
      schoolEmail,
      affiliationUpto,
      panNo,
      schoolAddress,
      schoolLocation,
      landMark,
      schoolPincode,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
      profileImage: profileImagePath,
      affiliationCertificate: affiliationCertificatePath,
      panFile: panFilePath,
    });

    await newSchoolRegistration.save();

    await sendSchoolRegistrationEmail(schoolName, schoolEmail, {
      userId: schoolId,
    });

    await User.findOneAndUpdate(
      { schoolId, role: "School" },
      { status: "Completed" },
      { new: true }
    );

    return res.status(201).json({
      message: "School Registration created successfully!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    console.error("Error creating School Profile:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        panNo: "PAN",
        schoolMobileNo: "Mobile Number",
        schoolEmail: "email",
      };

      const displayName = fieldNames[field] || field;

      return res.status(400).json({
        hasError: true,
        message: `This ${displayName} (${value}) is already registered. Please use a different ${displayName}.`,
        field: field,
        value: value,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to create School Profile.",
      error: error.message,
    });
  }
}

export default create;
