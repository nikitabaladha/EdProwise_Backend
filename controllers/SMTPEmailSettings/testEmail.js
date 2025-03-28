import SmtpEmailSetting from '../../models/SMTPEmailSetting.js';
import nodemailer from "nodemailer";

const testEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ hasError: true, message: "Email is required" });
        }

        // Fetch SMTP settings from the database
        const smtpSettings = await SmtpEmailSetting.findOne();
        if (!smtpSettings) {
            return res.status(500).json({ hasError: true, message: "SMTP settings not found" });
        }

        const isSSL = smtpSettings.mailEncryption === 'SSL' && smtpSettings.mailPort == "465";
        const isTLS = smtpSettings.mailEncryption === 'TLS' && smtpSettings.mailPort == "587";


        // Create transporter using stored SMTP settings
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
            to: email,
            subject: "Test Email",
            text: "Important Update Regarding Your Account",
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ hasError: false, message: "Test email sent successfully!" });

    } catch (error) {
        return res.status(500).json({ hasError: true, message: "Error sending email", error: error.message });
    }
};

export default testEmail;
