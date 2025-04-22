import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import VerificationCode from "../../models/VerificationCode.js";
import SellerProfile from "../../models/SellerProfile.js";
import School from "../../models/School.js";
import User from "../../models/User.js";
import Seller from "../../models/Seller.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationCode(req, res) {
  const { userId } = req.body;

  try {
    let user = await Seller.findOne({ userId });
    let userEmail = null;

    if (user) {
      const sellerDetails = await SellerProfile.findOne({ sellerId: user._id });

      if (sellerDetails) {
        userEmail = sellerDetails.emailId;
        console.log("Seller Email:", userEmail);
      }
    } else {
      user = await User.findOne({ userId });

      if (user) {
        console.log("School User Found:", user);
        const schoolDetails = await School.findOne({ schoolId: user.schoolId });

        if (schoolDetails) {
          userEmail = schoolDetails.schoolEmail;
          console.log("School Email:", userEmail);
        }
      }
    }
    console.log("user Details:", user, "Email :", userEmail);

    if (!user || !userEmail) {
      return res
        .status(404)
        .json({ hasError: true, message: "User not found or email missing." });
    }

    // Generate a new verification code
    const verificationCode = generateVerificationCode();

    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) throw new Error("SMTP settings not found");

    // Create transporter
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

    const logoImagePath = path.join(
      __dirname,
      "../../Images/edprowiseLogoImages/EdProwiseNewLogo.png"
    );
    console.log("Logo path verification:");
    console.log("Full path:", logoImagePath);
    console.log("File exists:", fs.existsSync(logoImagePath));

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
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    // Email content

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: userEmail,
      subject: "Password Reset Verification Code",
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
                               
                              .code{
                                  width: 60%;
                                  font-size: xx-large;
                                  text-align: center;
                                  background: #a9fffd;
                                  font-weight:bold;
                                  letter-spacing: 4px;
                                  display: block;
                                  margin: 0 auto;
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
                                  <p class="message">Dear ${userId},</p>
                                  
                                  <p class="message">We've received a request of verification code for reset password.</p>

                                  <p class="message">Here is your Verification code:</p>
      
                                  <div class="code"> 
                                     ${verificationCode}
                                  </div>

                                  <!-- User Details Box -->
                                  <p class="message">Please enter this code for verification</p>
                                  
                                  <p class="message">Note: This code will expire in 1 minute</p>
                      
                                  <!-- Action Button -->
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

    console.log(`Verification email sent successfully to ${userEmail}.`);

    await VerificationCode.findOneAndUpdate(
      { userId },
      { code: verificationCode, expiresAt: new Date(Date.now() + 1 * 60000) },
      { upsert: true, new: true }
    );

    return res.json({
      hasError: false,
      message: "Verification code sent to registered email.",
      email: userEmail,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return res
      .status(500)
      .json({ hasError: true, message: "Failed to send verification code." });
  }
}

export default sendVerificationCode;
