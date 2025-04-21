import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
const sendMarketingEmail = async (req, res) => {
  try {
    const { mailTo, subject, content } = req.body;

    if (!mailTo || !Array.isArray(mailTo) || mailTo.length === 0) {
      return res
        .status(400)
        .json({ hasError: true, message: "Send to email(s) are required." });
    }

    if (!subject?.trim() || !content?.trim()) {
      return res
        .status(400)
        .json({ hasError: true, message: "Subject and content are required." });
    }

    const smtpSettings = await SMTPEmailSetting.findOne();

    if (!smtpSettings) {
      return res
        .status(500)
        .json({ hasError: true, message: "SMTP settings not found." });
    }

    // Create transporter
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

    // Prepare mail options
    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: mailTo.join(","),
      subject: subject,
      html: content,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ hasError: false, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    return res
      .status(500)
      .json({ hasError: true, message: "Error sending email." });
  }
};
export default sendMarketingEmail;
