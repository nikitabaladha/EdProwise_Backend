import nodemailer from 'nodemailer';
import PayrollSmtpEmailSetting from '../../../../models/PayrollModule/AdminSettings/PayrollSmtpEmailSetting.js';

const sendPayrollTestEmail = async (req, res) => {
  try {
    const { email, schoolId } = req.body;


    if (!email || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "Email and School ID are required",
      });
    }

    const settings = await PayrollSmtpEmailSetting.findOne({ schoolId });
    console.log("setting",settings);

    if (!settings) {
      return res.status(404).json({
        hasError: true,
        message: "SMTP settings not found for this school",
      });
    }

    const transporter = nodemailer.createTransport({
      host: settings.mailHost,
      port: parseInt(settings.mailPort),
      secure: settings.mailEncryption === "SSL",
      auth: {
        user: settings.mailUsername,
        pass: settings.mailPassword,
      },
       tls: {
            rejectUnauthorized: false, // Temporarily bypass certificate validation
          },
          debug: true,
    });

    await transporter.sendMail({
      from: `"${settings.mailFromName}" <${settings.mailFromAddress}>`,
      to: email,
      subject: "Test Email - SMTP Configuration",
      html: `<p>This is a test email from your configured SMTP settings.</p>
      <p>This mail come from payroll SMTP setting</p>`,
    });

    return res.status(200).json({
      hasError: false,
      message: "Test email sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Failed to send test email",
      error: error.message,
    });
  }
};

export default sendPayrollTestEmail;