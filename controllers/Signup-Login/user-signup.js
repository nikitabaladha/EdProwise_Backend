import Counter from "../../models/Counter.js";
import User from "../../models/User.js";
import Seller from "../../models/Seller.js";
import saltFunction from "../../validators/saltFunction.js";
import signupValidationSchema from "../../validators/signupValidationSchema.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import SignUpEmailTemplate from "../../models/SignUpEmailTemplate.js";

async function userSignup(req, res) {
  try {
    const { error } =
      signupValidationSchema.signupValidationSchemaForUser.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details[0].message;
      return res.status(400).json({ message: errorMessages });
    }

    const { userId, password, role } = req.body;

    if (!["School", "Seller"].includes(role)) {
      return res
        .status(400)
        .json({ hasError: true, message: "Invalid role provided" });
    }

    const isExistingUser =
      role === "School"
        ? await User.findOne({ userId })
        : await Seller.findOne({ userId });

    if (isExistingUser) {
      return res
        .status(400)
        .json({ hasError: true, message: "User already exists" });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(password);
   


    if (role === "School") {
      const counter = await Counter.findOneAndUpdate(
        { _id: "schoolIdCounter" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );

      const nextSchoolId = `SID${counter.sequenceValue
        .toString()
        .padStart(5, "0")}`;

      const schoolUser = new User({
        schoolId: nextSchoolId,
        userId,
        password: hashedPassword,
        salt,
        role,
        status: "Pending",
      });

      await schoolUser.save();

      // add
      await sendSignupEmail(userId, role, nextSchoolId);
    //  

      return res.status(201).json({
        hasError: false,
        message: "School user registered successfully",
        data: {
          schoolId: nextSchoolId,
          userId: schoolUser.userId,
          role: schoolUser.role,
          status: schoolUser.status,
        },
      });
    } else if (role === "Seller") {
      const seller = new Seller({
        userId,
        password: hashedPassword,
        salt,
        role,
        status: "Pending",
      });

      await seller.save();

        // Send email after successful registration
        await sendSignupEmail(userId, role);
         // 

      return res.status(201).json({
        hasError: false,
        message: "Seller registered successfully",
        data: {
          userId: seller.userId,
          role: seller.role,
          status: seller.status,
        },
      });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ hasError: true, message: "Server error" });
  }
}

async function sendSignupEmail(userId, role, schoolId = "N/A", password = "******") {
  try {
    // Fetch SMTP settings from the database
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      console.error("SMTP settings not found.");
      return;
    }

    // Fetch email template from the database
    const emailTemplate = await SignUpEmailTemplate.findOne();
    if (!emailTemplate) {
      console.error("Signup email template not found.");
      return;
    }

    // Dynamic data object to replace placeholders
    const dynamicData = {
      "{userName}": userId,
      "{mailForm}": smtpSettings.mailFromName,
      "{email}": userId,
      "{password}": password, 
      "{app_url}": "http://localhost:3000/login", 
      "{role}": role,
      "{schoolId}": schoolId !== "N/A" ? schoolId : "", 
    };

    // Replace all placeholders dynamically
    let emailContent = emailTemplate.content;
    Object.keys(dynamicData).forEach((key) => {
      emailContent = emailContent.replace(new RegExp(key, "g"), dynamicData[key]);
    });

    const isSSL = smtpSettings.mailEncryption === "SSL" && smtpSettings.mailPort == "465";
    const isTLS = smtpSettings.mailEncryption === "TLS" && smtpSettings.mailPort == "587";

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.mailHost,
      port: parseInt(smtpSettings.mailPort),
      secure: isSSL,
      requireTLS: isTLS,
      auth: {
        user: smtpSettings.mailUsername,
        pass: smtpSettings.mailPassword,
      },
    });

    // Email options
    const mailOptions = {
      from: `${smtpSettings.mailFromName} <${smtpSettings.mailFromAddress}>`,
      to: userId,
      subject: emailTemplate.subject,
      html: emailContent, // Ensure email is sent as HTML
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Signup email sent successfully!");
  } catch (error) {
    console.error("Error sending signup email:", error);
  }
}


export default userSignup;
