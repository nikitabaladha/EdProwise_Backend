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

async function findUserByEmail(req, res) {
  const { email } = req.body;
  try {
    let user = await SellerProfile.findOne({ emailId: email });
    let userId = null;
    let userEmail = email;
    if (user) {
      const sellerDetails = await Seller.findOne({ _id: user.sellerId });
      if (sellerDetails) {
        userId = sellerDetails.userId;
      }
    } else {
      user = await School.findOne({ schoolEmail: email });

      if (user) {
        const schoolDetails = await User.findOne({
          schoolId: user.schoolId,
          role: "School",
        });
        console.log("School Details:", schoolDetails);

        if (schoolDetails) {
          userId = schoolDetails.userId;
        }
      }
    }

    if (!user || !userId) {
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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: userEmail,
      subject: "Verification Code for UserID Change",
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
                              .note-email{
                                font-size: 9px;
                                color: #4a5568;
                               }
                              
                              .note-content{
                                  padding: 0px 30px;
                                  text-align: center;
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
                              .fw-bold{
                              font-weight:bold;
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
                                  <p class="message fw-bold">Dear ${userId},</p>
                                  
                                  <p class="message">We've received a request to reset your userId.</p>

                                  <p class="message">Your verification code is:</p>
      
                                  <div class="code"> 
                                     ${verificationCode}
                                  </div>

                                  <!-- User Details Box -->
                                  <p class="message">Please enter this code to proceed with the userId reset.</p>
                                  
                                  <p class="message"><span class="fw-bold">Note: </span> This code will expire in 1 minute.</p>
                      
                                  <!-- Action Button -->
                                  <p class="message">If you have any questions or need assistance, feel free to <a href="${contactUrl}" class="contact-text">contact us.</a> We're here to help.  </p>
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

    console.log(`Verification email sent successfully to ${userEmail}.`);

    await VerificationCode.findOneAndUpdate(
      { userId },
      { code: verificationCode, expiresAt: new Date(Date.now() + 1 * 60000) },
      { upsert: true, new: true }
    );

    return res.json({
      hasError: false,
      message: "Verification code sent to registered email.",
      userId: userId,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return res
      .status(500)
      .json({ hasError: true, message: "Failed to send verification code." });
  }
}

export default findUserByEmail;
