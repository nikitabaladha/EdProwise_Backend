import SmtpEmailSetting from "../../models/SMTPEmailSetting.js";
import nodemailer from "nodemailer";

const testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ hasError: true, message: "Email is required" });
    }

    // Fetch SMTP settings from the database
    const smtpSettings = await SmtpEmailSetting.findOne();
    if (!smtpSettings) {
      return res
        .status(500)
        .json({ hasError: true, message: "SMTP settings not found" });
    }

    console.log("SMTP Settings:", smtpSettings);

    // Create transporter with better debugging
    const transporter = nodemailer.createTransport({
      host: smtpSettings.mailHost,
      port: parseInt(smtpSettings.mailPort),
      secure: smtpSettings.mailEncryption === "SSL",
      auth: {
        user: smtpSettings.mailUsername,
        pass: smtpSettings.mailPassword,
      },
      tls: {
        rejectUnauthorized: false, // Temporarily bypass certificate validation
      },
      debug: true, // Enable verbose debugging
    });

    // Verify connection first
    try {
      await transporter.verify();
      console.log("Server is ready to take our messages");
    } catch (verifyError) {
      console.error("SMTP Connection verification failed:", verifyError);
      return res.status(500).json({
        hasError: true,
        message: "SMTP connection failed",
        error: verifyError.message,
      });
    }

    // Email options
    const mailOptions = {
      from: `${smtpSettings.mailFromName} <${smtpSettings.mailFromAddress}>`,
      to: email,
      subject: "Test Email",
      text: "Important Update Regarding Your Account",
      headers: {
        "X-Mailer": "NodeMailer",
      },
    };

    console.log("Attempting to send email with options:", mailOptions);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return res.status(200).json({
      hasError: false,
      message: "Test email sent successfully!",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Full error details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Error sending email",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export default testEmail;
