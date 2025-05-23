// import nodemailer from "nodemailer";
// import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
// const sendMarketingEmail = async (req, res) => {
//   try {
//     const { mailTo, subject, content } = req.body;

//     if (!mailTo || !Array.isArray(mailTo) || mailTo.length === 0) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "Send to email(s) are required." });
//     }

//     if (!subject?.trim() || !content?.trim()) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "Subject and content are required." });
//     }

//     const smtpSettings = await SMTPEmailSetting.findOne();

//     if (!smtpSettings) {
//       return res
//         .status(500)
//         .json({ hasError: true, message: "SMTP settings not found." });
//     }

//     // Create transporter
//     const transporter = nodemailer.createTransport({
//       host: smtpSettings.mailHost,
//       port: smtpSettings.mailPort,
//       secure: smtpSettings.mailEncryption === "SSL",
//       auth: {
//         user: smtpSettings.mailUsername,
//         pass: smtpSettings.mailPassword,
//       },
//       tls: { rejectUnauthorized: false },
//     });

//     // Prepare mail options
//     const mailOptions = {
//       from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
//       to: mailTo.join(","),
//       subject: subject,
//       html: content,
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);

//     return res
//       .status(200)
//       .json({ hasError: false, message: "Email sent successfully!" });
//   } catch (error) {
//     console.error("Email sending error:", error);
//     return res
//       .status(500)
//       .json({ hasError: true, message: "Error sending email." });
//   }
// };
// export default sendMarketingEmail;

// import nodemailer from "nodemailer";
// import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
// import fs from "fs";
// import path from "path";

// const sendMarketingEmail = async (req, res) => {
//   try {
//     console.log("Request files received:", req.files); // Detailed logging
//     console.log("Request body:", req.body);

//     const { mailTo, subject, content } = req.body;
//     const attachments = req.files || [];

//     attachments.forEach((file, index) => {
//       console.log(`Attachment ${index + 1}:`, {
//         name: file.originalname,
//         size: file.size,
//         path: file.path,
//         exists: fs.existsSync(file.path)
//       });
//     });
//     // Validation
//     if (!mailTo || !Array.isArray(mailTo) || mailTo.length === 0) {
//       // Clean up files if validation fails
//       attachments.forEach(file => fs.unlinkSync(file.path));
//       return res.status(400).json({ 
//         hasError: true, 
//         message: "Recipient emails are required" 
//       });
//     }

//     if (!subject?.trim() || !content?.trim()) {
//       attachments.forEach(file => fs.unlinkSync(file.path));
//       return res.status(400).json({ 
//         hasError: true, 
//         message: "Subject and content are required" 
//       });
//     }

//     // Get SMTP settings
//     const smtpSettings = await SMTPEmailSetting.findOne();
//     if (!smtpSettings) {
//       attachments.forEach(file => fs.unlinkSync(file.path));
//       return res.status(500).json({ 
//         hasError: true, 
//         message: "SMTP settings not found" 
//       });
//     }

//     // Create transporter
//     const transporter = nodemailer.createTransport({
//       host: smtpSettings.mailHost,
//       port: smtpSettings.mailPort,
//       secure: smtpSettings.mailEncryption === "SSL",
//       auth: {
//         user: smtpSettings.mailUsername,
//         pass: smtpSettings.mailPassword,
//       },
//       tls: { rejectUnauthorized: false },
//     });

//     // Prepare email with attachments
//     const mailOptions = {
//       from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
//       to: mailTo.join(","),
//       subject: subject,
//       html: content,
//       attachments: attachments.map(file => ({
//         filename: file.originalname,
//         path: file.path,
//         contentType: file.mimetype
//       }))
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);

//     // Clean up files after successful send
//     attachments.forEach(file => fs.unlinkSync(file.path));

//     return res.status(200).json({ 
//       hasError: false, 
//       message: "Email sent successfully" 
//     });

//   } catch (error) {
//     // Clean up files if error occurs
//     if (req.files) {
//       req.files.forEach(file => fs.unlinkSync(file.path));
//     }
//     console.error("Email sending error:", error);
//     return res.status(500).json({ 
//       hasError: true, 
//       message: "Error sending email",
//       error: error.message 
//     });
//   }
// };

// export default sendMarketingEmail;

// sendMarketingEmail.js
import nodemailer from "nodemailer";
import fs from "fs";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";

const sendMarketingEmail = async (req, res) => {
  try {
    const { mailTo, subject, content } = req.body;
    const attachments = req.files || [];

    // Validate input
    if (!mailTo || !Array.isArray(mailTo) || mailTo.length === 0) {
      attachments.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
      return res.status(400).json({ hasError: true, message: "Recipient emails are required" });
    }
    if (!subject?.trim() || !content?.trim()) {
      attachments.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
      return res.status(400).json({ hasError: true, message: "Subject and content are required" });
    }

    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      attachments.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
      return res.status(500).json({ hasError: true, message: "SMTP settings not found" });
    }

    const transporter = nodemailer.createTransport({
      host: smtpSettings.mailHost,
      port: smtpSettings.mailPort,
      secure: smtpSettings.mailEncryption === "SSL",
      auth: {
        user: smtpSettings.mailUsername,
        pass: smtpSettings.mailPassword,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: mailTo.join(","),
      subject,
      html: content,
      attachments: attachments.map(file => ({
        filename: file.originalname,
        path: file.path,
        contentType: file.mimetype
      }))
    };

    await transporter.sendMail(mailOptions);

    attachments.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));

    return res.status(200).json({ hasError: false, message: "Email sent successfully" });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
    }
    console.error("Email sending error:", error);
    return res.status(500).json({ hasError: true, message: "Error sending email", error: error.message });
  }
};

export default sendMarketingEmail;
