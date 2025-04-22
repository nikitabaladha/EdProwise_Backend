import User from "../../models/User.js";
import saltFunction from "../../validators/saltFunction.js";
import School from "../../models/School.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sendPasswordUpdateEmail(
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

    // 3. Create Nodemailer transporter
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
      console.error("Logo not found at:", logoImagePath);
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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const loginUrl = `${frontendUrl.replace(/\/+$/, "")}/login/admin`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    // 4. Prepare credentials
    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: "Update Password",
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
                        
                        .welcome-heading {
                            font-size: 24px;
                            font-weight: 600;
                            margin: 0;
                            color: black;
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

                        .detail-item {
                            margin-bottom: 12px;
                            display: flex;
                        }
                        
                        .detail-value {
                            color: #4a5568;
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
                        
                        /* Responsive */
                        @media only screen and (max-width: 600px) {
                            .email-container {
                                border-radius: 0;
                                margin: 0px auto;
                            }
                            .logo {
                                width: 200px;
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
                            <p class="message">Dear ${
                              usersWithCredentials.userName
                            },</p>
                            
                            <p class="message">You recently update the password of ${
                              smtpSettings.mailFromName
                            } account.</p>
                            <p class="message">Admin ${schoolName}, password has been successfully updated.</p>

                            <!-- User Details Box -->
                            <p class="message">The new login details for Admin ${
                              usersWithCredentials.userName
                            } are: </p>
                            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                              <thead><tr><th>Role</th><th>UserID</th><th>Password</th></tr></thead>
                              <tbody>
                                <tr>
                                  <td class="center-text">School</td>
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
                            <p class="message">Please click below button for login </p>
                            <div style="text-align: center;">
                                <a href="${loginUrl}" class="action-button">Login</a>
                            </div>
                            
                             <p class="message">Please <a href="${contactUrl}" class="contact-text">contact us</a> in case you have to ask or tell us something </p>
                            <!-- Signature -->
                            <div class="signature">
                                <p>Best regards,</p>
                                <p><strong>${
                                  smtpSettings.mailFromName
                                } Team</strong></p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                            <p>All Copyright © ${new Date().getFullYear()} EdProwise Tech PVT LTD. All Rights Reserved.</p>
                        </div>
                    </div>
                  </div>  
                </body>
                </html>
            `,
      attachments: attachments,
    };

    await transporter.sendMail(mailOptions);

    console.log("Password update email sent successfully");
    return {
      hasError: false,
      message: "Password update email sent successfully.",
    };
  } catch (error) {
    console.error("Error sending password update email:", error);
    return {
      hasError: true,
      message: "Email is not proper, we cannot send the email.",
    };
  }
}

async function changeSchoolAdminPassword(req, res) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request a quote.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        hasError: true,
        message: "Both current and new passwords are required.",
      });
    }

    const user = await User.findOne({ schoolId, role: "School" });

    if (!user) {
      return res
        .status(404)
        .json({ hasError: true, message: "User not found." });
    }

    const isPasswordValid = saltFunction.validatePassword(
      currentPassword,
      user.password,
      user.salt
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ hasError: true, message: "Current password is incorrect." });
    }

    const { hashedPassword, salt } = saltFunction.hashPassword(newPassword);
    user.password = hashedPassword;
    user.salt = salt;
    await user.save();

    const school = await School.findOne({ schoolId });
    const schoolEmail = school?.schoolEmail;
    const schoolName = school?.schoolName;

    console.log(`Password changed for school: ${schoolName} (${schoolEmail})`);

    await sendPasswordUpdateEmail(schoolName, schoolEmail, {
      userName: user.userId,
      password: newPassword,
    });

    return res.status(200).json({
      hasError: false,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ hasError: true, message: "Server error." });
  }
}

export default changeSchoolAdminPassword;
