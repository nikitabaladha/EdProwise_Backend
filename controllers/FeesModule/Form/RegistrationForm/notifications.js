import nodemailer from 'nodemailer';
import SmtpEmailSetting from '../../../../models/SMTPEmailSetting.js';


export const sendPaymentLinkMail = async ({
    to,
    name,
    amount,
    txnId,
    paymentUrl,
    academicYear,
}) => {
    try {

        const smtpSetting = await SmtpEmailSetting.findOne().lean();
        if (!smtpSetting) {
            throw new Error('SMTP settings not configured in the database.');
        }

        const {
            mailHost,
            mailPort,
            mailUsername,
            mailPassword,
            mailEncryption,
            mailFromAddress,
            mailFromName,
        } = smtpSetting;


        const transporter = nodemailer.createTransport({
            host: mailHost,
            port: Number(mailPort),
            secure: mailEncryption === 'ssl' || mailEncryption === 'tls',
            auth: {
                user: mailUsername,
                pass: mailPassword,
            },

            tls: {
                rejectUnauthorized: false,
            },
        });


        const html = `
      <h2>Registration Fee Payment</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your registration fee for <strong>${academicYear}</strong> is <strong>₹${amount}</strong>.</p>
      <p>Transaction ID: <code>${txnId}</code></p>
      <p>
        <a href="${paymentUrl}" style="background:#28a745;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">
          Pay Now
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this link:<br/>
         <code style="background:#f4f4f4;padding:2px 6px;border-radius:3px;">${paymentUrl}</code>
      </p>
      <hr/>
      <small style="color:#777;">This is an auto-generated email. Do not reply.</small>
    `;


        await transporter.sendMail({
            from: `"${mailFromName}" <${mailFromAddress}>`,
            to,
            subject: `Pay Registration Fee – ${txnId}`,
            html,
        });

        console.log(`Payment link email sent to ${to} (TXN: ${txnId})`);
    } catch (error) {
        console.error('Failed to send payment link email:', error.message);
        throw error;
    }
};