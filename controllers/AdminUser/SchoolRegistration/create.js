import SchoolRegistration from "../../../models/School.js";
import User from "../../../models/User.js";
import SchoolRegistrationValidator from "../../../validators/AdminUser/SchoolRegistrationValidator.js";
import saltFunction from "../../../validators/saltFunction.js";

// Add Umesh 
import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../../models/SMTPEmailSetting.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function generateRandomPassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
}

function generateSchoolId() {
  const prefix = "SID";
  const randomSuffix = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `${prefix}${randomSuffix}`;
}

async function sendSchoolRegistrationEmail(schoolName, schoolEmail, usersWithCredentials) {
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
      secure: false, 
      auth: {
        user: smtpSettings.mailUsername,
        pass: smtpSettings.mailPassword,
      },
      tls: {
        rejectUnauthorized: false, 
      }
    });

    const logoImagePath = path.join(__dirname, '../../../Images/edprowiseLogoImages/EdProwiseNewLogo.png');
            console.log('Logo path verification:');
            console.log('Full path:', logoImagePath);
            console.log('File exists:', fs.existsSync(logoImagePath));
            
            if (!fs.existsSync(logoImagePath)) {
              console.error('Logo not found at:', logoImagePath);
              return { hasError: true, message: "Logo file not found" };
            }
        
            // Read logo as base64 for fallback
            const logoBase64 = fs.readFileSync(logoImagePath, { encoding: 'base64' });
            const base64Src = `data:image/png;base64,${logoBase64}`;
        
            const attachments = [{
              filename: 'logo.png',
              path: logoImagePath,
              cid: 'edprowiselogo@company', // Unique CID
              contentDisposition: 'inline',
              headers: {
                'Content-ID': '<edprowiselogo@company>'
              }
            }];
    
    
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const loginUrl = `${frontendUrl.replace(/\/+$/, '')}/login`;
            const contactUrl = `${frontendUrl.replace(/\/+$/, '')}/contact-us`;

    // 4. Prepare credentials 
    const credentialsHtml = `
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        ${usersWithCredentials.map(user => `
        <tr>
          <th colspan="2" class="main" style="background: #a9fffd";>Role: ${user.role}</th>
        </tr>
        <tr>
          <th>UserID</th>
          <td style="text-align: center;">${user.userId}</td>
        </tr>
        <tr>
          <th>Password</th>
          <td style="text-align: center;">${user.password}</td>
        </tr>
        <tr>
          <th colspan="2" class="main"></th>
        </tr>
        `).join('')}
      
    </table>
  `;
  
    // 5. Replace placeholders in email template
    

    // 6. Send email
    const mailOptions ={
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: `${schoolName} Registration Done`,
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
                          width:100%;
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
                            <p class="message">Dear School,</p>
                            
                            <p class="message">Welcome to the ${smtpSettings.mailFromName},</p>
                            <p class="message">${schoolName}, school account has been successfully created.</p>

                            <!-- User Details Box -->
                            <p class="message">The login details for ${schoolName} are: </p>
                            
                            ${credentialsHtml}
                
                            <!-- Action Button -->
                            <p class="message">Please click below button for login </p>
                            <div style="text-align: center;">
                                <a href="${loginUrl}" class="action-button">Login</a>
                            </div>
                            
                             <p class="message">Please <a href="${contactUrl}" class="contact-text">contact us</a> in case you have to ask or tell us something </p>
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
                    </div>
                  </div>  
                </body>
                </html>
            `,
            attachments: attachments 
    };
    
    

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    console.log("Registration email sent successfully");
    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending registration email:", error);
    return { hasError: true, message: "Email is not proper, we cannot send the email." };
  }
}



async function create(req, res) {
  try {
    // Validate request body
    const { error } = SchoolRegistrationValidator.SchoolRegistrationCreateValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ hasError: true, message: error.details.map(err => err.message).join(", ") });
    }

    const { schoolName, schoolMobileNo, schoolEmail, schoolAddress, schoolLocation, affiliationUpto, panNo } = req.body;
    const { affiliationCertificate, panFile, profileImage } = req.files || {};

    // Validate file uploads
    if (!affiliationCertificate?.[0]) {
      return res.status(400).json({ hasError: true, message: "Affiliation Certificate is required." });
    }
    if (!panFile?.[0]) {
      return res.status(400).json({ hasError: true, message: "Pan file is required." });
    }

    // Set profile image path (default to dummy image if not provided)
    const profileImagePath = profileImage?.[0]
      ? `/Images/SchoolProfile/${profileImage[0].filename}`
      : "/Images/DummyImages/Dummy_Profile.png";

    // Determine file paths based on MIME type
    const affiliationCertificatePath = affiliationCertificate[0].mimetype.startsWith("image/")
      ? "/Images/SchoolAffiliationCertificate"
      : "/Documents/SchoolAffiliationCertificate";
    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? "/Images/SchoolPanFile"
      : "/Documents/SchoolPanFile";

    // Construct full paths
    const affiliationCertificateFullPath = `${affiliationCertificatePath}/${affiliationCertificate[0].filename}`;
    const panFileFullPath = `${panFilePath}/${panFile[0].filename}`;

    // Generate unique School ID
    const schoolId = generateSchoolId();

    // Create School Registration entry
    const newSchoolRegistration = new SchoolRegistration({
      schoolId,
      schoolName,
      schoolMobileNo,
      schoolEmail,
      schoolAddress,
      schoolLocation,
      profileImage: profileImagePath,
      affiliationCertificate: affiliationCertificateFullPath,
      affiliationUpto,
      panNo,
      panFile: panFileFullPath,
    });

    await newSchoolRegistration.save();

    // Define user roles with unique prefixes
    const roles = [
      { role: "School", prefix: "SAdmin" },
      { role: "Principal", prefix: "Principal" },
      { role: "Auditor", prefix: "Audit" },
      { role: "User", prefix: "User1" },
      { role: "User", prefix: "User2" },
    ];

    // Create user accounts
    // add
    const usersWithCredentials = [];

    const usersToSave = roles.map(({ role, prefix }) => {
      const userId = `${prefix}_${schoolId}`;
      const password = generateRandomPassword();
      const { hashedPassword, salt } = saltFunction.hashPassword(password);


      // Store credentials for email UmeshAdded
      usersWithCredentials.push({
        userId,
        role,
        password: password
      });

      console.log("User Created ->", { userId, password });

      return new User({
        schoolId,
        userId,
        password: hashedPassword,
        salt,
        role,
        status: "Pending",
      });
    });

    // Save user accounts in bulk
    await User.insertMany(usersToSave);

    // add
    await sendSchoolRegistrationEmail(schoolName, schoolEmail, usersWithCredentials);

    return res.status(201).json({
      message: "School Registration created successfully with users!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    console.error("Error creating School Registration:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: "Duplicate schoolId or userId. Please check the data and try again.",
      });
    }

    return res.status(500).json({
      message: "Failed to create School Registration.",
      error: error.message,
    });
  }
}

export default create;
