import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import SellerProfile from "../../models/SellerProfile.js";
import School from "../../models/School.js";
import User from "../../models/User.js";
import Seller from "../../models/Seller.js";
import saltFunction from "../../validators/saltFunction.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sendPasswordUpdateEmail = async (
  companyName,
  email,
  usersWithCredentials,
  role
) => {
  try {
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings)
      return { hasError: true, message: "SMTP settings not found." };

    const transporter = nodemailer.createTransport({
      host: smtpSettings.mailHost,
      port: smtpSettings.mailPort,
      secure: smtpSettings.mailEncryption === "SSL",
      auth: {
        user: smtpSettings.mailUsername,
        pass: smtpSettings.mailPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const logoImagePath = path.join(
      __dirname,
      "../../Images/edprowiseLogoImages/EdProwiseNewLogo.png"
    );
    if (!fs.existsSync(logoImagePath)) {
      return { hasError: true, message: "Logo file not found" };
    }

    // Read logo as base64 for fallback
    const logoBase64 = fs.readFileSync(logoImagePath, { encoding: "base64" });
    const base64Src = `data:image/png;base64,${logoBase64}`;

    const attachments = [
      {
        filename: "logo.png",
        path: logoImagePath,
        cid: "edprowiselogo@company", // Unique CID
        contentDisposition: "inline",
        headers: {
          "Content-ID": "<edprowiselogo@company>",
        },
      },
    ];

    const frontendUrl = process.env.FRONTEND_URL;
    const loginUrl = `${frontendUrl.replace(/\/+$/, "")}/login`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: email,
      subject: "Your Password Has Been Successfully Changed",
      html: `
          <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
        /* Base Styles */
        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;    
        }
            
       .outer-div{
          border: 1px solid transparent;
          background-color: #f1f1f1;
        }
        /* Email Container */
        .email-container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px;    
        }
        
        /* Header Section */
        .header {
            background: #c2e7ff;
            padding: 20px 20px;
            text-align: center;
            color: #333333;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
        }

        .logo {
            width: 250px;
            height: auto;
            display: block;
            margin: 0 auto;
            -ms-interpolation-mode: bicubic;
        }
         
        /* Content Section */
        .content {
            padding: 30px;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
        }
        
        /* User Details Box */
        .center-text {
          text-align: center;
        }
        .note-email{
          font-size: 9px;
          color: #4a5568;
         }
        
        .note-content{
            padding: 0px 30px;
            text-align: center;
        }
        /* Action Button */
        .action-button {
            display: inline-block;
            background: #04d3d4;
            color: white !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-weight: 600;
            margin: 5px 0 20px ;
            text-align: center;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 20px;
            background: #a9fffd;
            font-size: 14px;
            color: #718096;
        }
        
        .signature {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #e2e8f0;
        }
        .contact-text{
          color: #0000FF;
        }    
        .fw-bold{
          font-weight: bold;
        }  
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                border-radius: 0;
            }
            .logo {
                width: 200px;
            }
            .note-content{
              padding: 0px 20px;
            }
            .content {
                padding: 20px;
            }    
        }
    </style>
</head>
<body>
<div class="outer-div">
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <div class="logo-container">
           <img src="cid:edprowiselogo@company" 
         alt="EdProwise Logo" 
         class="logo"
         style="width:250px;height:auto;display:block;">
            </div>
             
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <p class="message fw-bold">Dear ${companyName},</p>
            
            <p class="message">We wanted to inform you that your password has been successfully changed.</p>
            <p class="message">Here are your updated login details:</p>
            <!-- User Details Box -->
              <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                <thead><tr><th>Role</th><th>UserID</th><th>Password</th></tr></thead>
                <tbody>
                  <tr>
                    <td class="center-text">${role}</td>
                    <td class="center-text">${
                      usersWithCredentials.userName
                    }</td>
                    <td class="center-text">${
                      usersWithCredentials.password
                    }</td>
                  </tr>
                </tbody>
              </table>

            <!-- Action Button -->

            <p class="message">To access your account, please click the button below: </p>
              <div style="text-align: center;">
                  <a href="${loginUrl}" class="action-button">Login</a>
              </div>

              <p class="message">If you did not request this change, please contact our team immediately.</p>

              <p class="message">If you have any questions or need assistance, feel free to <a href="${contactUrl}" class="contact-text">contact us.</a> We're here to help.  </p>                    
             <!-- Signature -->
            <div class="signature">
                <p>Best regards,</p>
                <p><strong>${smtpSettings.mailFromName} Team</strong></p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>All Copyright © ${new Date().getFullYear()} EdProwise Tech PVT LTD. All Rights Reserved.</p>
        </div>
        <div class="note-content">
            <p class="note-email">This e-mail was sent from a notification-only address that can't accept incoming e-mail. Please don't reply to this message.</p>
        </div>
    </div>
  </div>  
</body>
</html>

                      `,
      attachments: attachments,
    };

    await transporter.sendMail(mailOptions);

    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending password update email:", error);
    return { hasError: true, message: "Failed to send email." };
  }
};

const resetUserOrSellerPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        hasError: true,
        message: "userId and newPassword are required.",
      });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(newPassword);

    // Try school user
    let user = await User.findOne({ userId });
    if (user) {
      user.password = hashedPassword;
      user.salt = salt;
      await user.save();

      const school = await School.findOne({ schoolId: user.schoolId });
      if (school) {
        await sendPasswordUpdateEmail(
          school.schoolName,
          school.schoolEmail,
          { userName: user.userId, password: newPassword },
          "School"
        );
      }

      return res.status(200).json({
        hasError: false,
        message: "Password updated for school user.",
      });
    }

    // Try seller
    let seller = await Seller.findOne({ userId });
    if (seller) {
      seller.password = hashedPassword;
      seller.salt = salt;
      await seller.save();

      const sellerProfile = await SellerProfile.findOne({
        sellerId: seller._id,
      });
      if (sellerProfile) {
        await sendPasswordUpdateEmail(
          sellerProfile.companyName,
          sellerProfile.emailId,
          { userName: seller.userId, password: newPassword },
          "Seller"
        );
      }

      return res.status(200).json({
        hasError: false,
        message: "Password updated for seller.",
      });
    }

    return res.status(404).json({
      hasError: true,
      message: "User ID not found in User or Seller collections.",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);
    return res.status(500).json({ hasError: true, message: "Server error." });
  }
};

export default resetUserOrSellerPassword;
