import mongoose from "mongoose";
import SellerProfile from "../../models/SellerProfile.js";
import SellerProfileValidator from "../../validators/Seller/SellerProfile.js";
import Seller from "../../models/Seller.js";
import saltFunction from "../../validators/saltFunction.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import SellerRegistrationEmailTemplate from "../../models/EmailTeamplates/SellerRegistrationEmailTemplate.js";

function generateUserId() {
  const prefix = "SELID";
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const formattedSuffix = String(randomSuffix).padStart(6, "0");
  return `${prefix}${formattedSuffix}`;
}

function generateRandomPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendSellerRegistrationEmail(
  companyName,
  companyEmail,
  userCredentials
) {
  try {
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) throw new Error("SMTP settings not found");

    const emailTemplate = await SellerRegistrationEmailTemplate.findOne();
    if (!emailTemplate) throw new Error("Email template not found");
    console.log(emailTemplate);

    const transporter = nodemailer.createTransport({
      host: smtpSettings.mailHost,
      port: smtpSettings.mailPort,
      secure: false,
      auth: {
        user: smtpSettings.mailUsername,
        pass: smtpSettings.mailPassword,
      },
      tls: { rejectUnauthorized: false },
    });

    const credentialsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 50%;">
        <thead><tr><th>Role</th><th>UserID</th><th>Password</th></tr></thead>
        <tbody>
          <tr>
            <td>Seller</td>
            <td>${userCredentials.userId}</td>
            <td>${userCredentials.password}</td>
          </tr>
        </tbody>
      </table>
    `;

    const emailContent = emailTemplate.content
      // .replace(/{CompanyName}/g, emailTemplate.mailFrom)
      .replace(/{mailForm}/g, emailTemplate.mailFrom)
      .replace(/{sellerCompanyName}/g, companyName)
      .replace(/{Credentials}/g, credentialsHtml)
      .replace(/{app_url}/g, smtpSettings.mailHost);

    await transporter.sendMail({
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: companyEmail,
      subject: emailTemplate.subject,
      html: emailContent,
    });

    console.log("Seller registration email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending registration email:", error);
    return false;
  }
}

async function createByAdmin(req, res) {
  try {
    const { error } =
      SellerProfileValidator.SellerProfileCreateValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const {
      companyName,
      companyType,
      gstin,
      pan,
      tan,
      cin,
      address,
      cityStateCountry,
      landmark,
      pincode,
      contactNo,
      alternateContactNo,
      emailId,
      accountNo,
      ifsc,
      accountHolderName,
      bankName,
      branchName,
      noOfEmployees,
      ceoName,
      turnover,
      dealingProducts,
    } = req.body;

    const sellerProfileImagePath = "/Images/SellerProfile";
    const sellerProfile =
      req.files && req.files.sellerProfile && req.files.sellerProfile[0]
        ? `${sellerProfileImagePath}/${req.files.sellerProfile[0].filename}`
        : "/Images/DummyImages/Dummy_Profile.png";

    // Ensure files are present before trying to access them
    const panFile = req.files && req.files.panFile ? req.files.panFile : null;
    const gstFile = req.files && req.files.gstFile ? req.files.gstFile : null;
    const tanFile = req.files && req.files.tanFile ? req.files.tanFile : null;
    const cinFile = req.files && req.files.cinFile ? req.files.cinFile : null;

    // Check if required files are missing
    if (!panFile || !panFile[0]) {
      return res.status(400).json({
        hasError: true,
        message: "Seller PAN File is required.",
      });
    }
    if (!gstFile || !gstFile[0]) {
      return res.status(400).json({
        hasError: true,
        message: "Seller GST File is required.",
      });
    }

    // File paths initialization
    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? `/Images/SellerPanFile/${panFile[0].filename}`
      : `/Documents/SellerPanFile/${panFile[0].filename}`;
    const gstFilePath = gstFile[0].mimetype.startsWith("image/")
      ? `/Images/SellerGstFile/${gstFile[0].filename}`
      : `/Documents/SellerGstFile/${gstFile[0].filename}`;
    const tanFilePath =
      tanFile && tanFile[0].mimetype.startsWith("image/")
        ? `/Images/SellerTanFile/${tanFile[0].filename}`
        : tanFile
        ? `/Documents/SellerTanFile/${tanFile[0].filename}`
        : null;
    const cinFilePath =
      cinFile && cinFile[0].mimetype.startsWith("image/")
        ? `/Images/SellerCinFile/${cinFile[0].filename}`
        : cinFile
        ? `/Documents/SellerCinFile/${cinFile[0].filename}`
        : null;

    const sellerId = new mongoose.Types.ObjectId();
    const userId = generateUserId();
    const password = generateRandomPassword();
    const { hashedPassword, salt } = saltFunction.hashPassword(password);

    const newSellerProfile = new SellerProfile({
      sellerId,
      companyName,
      companyType,
      gstin,
      pan,
      tan,
      cin,
      address,
      cityStateCountry,
      landmark,
      pincode,
      contactNo,
      alternateContactNo,
      emailId,
      sellerProfile,
      panFile: panFilePath,
      gstFile: gstFilePath,
      tanFile: tanFilePath,
      cinFile: cinFilePath,
      accountNo,
      ifsc,
      accountHolderName,
      bankName,
      branchName,
      noOfEmployees,
      ceoName,
      turnover,
      dealingProducts,
      randomId: userId,
      status: "Completed",
    });

    await newSellerProfile.save();

    await sendSellerRegistrationEmail(companyName, emailId, {
      userId,
      password,
    });

    const newSeller = new Seller({
      _id: sellerId,
      userId,
      password: hashedPassword,
      salt,
      role: "Seller",
      status: "Completed",
      randomId: userId,
    });

    await newSeller.save();

    return res.status(201).json({
      hasError: false,
      message: "Seller profile created successfully.",
      data: newSellerProfile,
    });
  } catch (error) {
    console.error("Error creating Seller Profile:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        gstin: "GSTIN",
        pan: "PAN",
        contactNo: "contact number",
        emailId: "email",
        accountNo: "account number",
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
      message: "Failed to create Seller Profile.",
      error: error.message,
    });
  }
}

export default createByAdmin;
