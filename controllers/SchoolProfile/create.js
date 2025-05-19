import SchoolRegistration from "../../models/School.js";
import SchoolRegistrationValidator from "../../validators/AdminUser/SchoolRegistrationValidator.js";
import User from "../../models/User.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import AdminUser from "../../models/AdminUser.js";
import { NotificationService } from "../../notificationService.js";

import mongoose from "mongoose";

async function sendSchoolRegistrationEmail(
  schoolName,
  schoolEmail,
  usersWithCredentials
) {
  try {
    // 1. Get SMTP settings from database
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      console.error("SMTP settings not found");
      return { hasError: true, message: "SMTP settings not configured" };
    }

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

    // Prepare attachments with CID
    // const attachments = [{
    //   filename: 'logo.png',
    //   path: logoImagePath,
    //   cid: 'edprowiselogo', // Must match the CID in HTML
    //   contentDisposition: 'inline'
    // }];

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

    // const logoImagePath = path.join(
    //   __dirname, '..', '..',
    //   'Images',
    //   'edprowiseLogoImages',
    //   'EdProwiseNewLogo.png'
    // );

    // console.log('Logo path verification:');
    // console.log('__dirname:', __dirname);
    // console.log('Resolved path:', logoImagePath);
    // console.log('File exists:', fs.existsSync(logoImagePath));

    // if (!fs.existsSync(logoImagePath)) {
    //   console.error('Could not find logo at:', logoImagePath);
    //   return { hasError: true, message: "Logo file not found" };
    // }

    // try {
    //   const imageBuffer = fs.readFileSync(logoImagePath);
    //   fs.writeFileSync('./logo_test_output.png', imageBuffer); // Test output
    //   console.log('Logo file verified and test copy created');
    // } catch (err) {
    //   console.error('Error reading logo file:', err);
    //   return { hasError: true, message: "Logo file cannot be read" };
    // }

    //  <img src="cid:edprowiselogo"
    //    onerror="this.src='${base64Src}'"
    //    alt="EdProwise Logo" class="logo">

    // const attachments = [{
    //   filename: "EdProwiseNewLogo.png",
    //   path: logoImagePath,
    //   cid: "logo"
    // }];

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const loginUrl = `${frontendUrl.replace(/\/+$/, "")}/login`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    // 6. Send email
    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: `Registration Successfull - ${schoolName}`,
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

                        .note-email{
                          font-size: 9px;
                          color: #4a5568;
                         }
                        
                        .note-content{
                            padding: 0px 30px;
                            text-align: center;
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
                            .content {
                                padding: 20px;
                            }
                            .note-content{
                               padding: 0px 20px;
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
                            <p class="message fw-bold">Dear ${schoolName},</p>
                            
                            <p class="message">Welcome to the ${
                              smtpSettings.mailFromName
                            },</p>
                            <p class="message">We’re pleased to inform you that the school account for ${schoolName} has been successfully created.</p>

                            <!-- User Details Box -->
                            <p class="message">The login details for ${schoolName} are: </p>
                            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                              <thead><tr><th>Role</th><th>UserID</th></tr></thead>
                              <tbody>
                                <tr>
                                  <td class="center-text">School</td>
                                  <td class="center-text">${
                                    usersWithCredentials.userId
                                  }</td>
                                </tr>
                              </tbody>
                            </table>
                            
                            
                            <!-- Action Button -->
                            <p class="message">To access your account, please click the button below: </p>
                            <div style="text-align: center;">
                                <a href="${loginUrl}" class="action-button">Login</a>
                            </div>
                            
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

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    // 6. Verify in email client
    console.log("Check your email client:");
    console.log('- Look for "Display Images" option');
    console.log("- Check spam folder if not received");

    console.log("Email sent:", info.messageId);
    return { hasError: false, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending registration email:", error);
    return {
      hasError: true,
      message: "Email is not proper, we cannot send the email.",
    };
  }
}
async function create(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const { error } =
      SchoolRegistrationValidator.SchoolProfileCreateByUserValidator.validate(
        req.body
      );
    if (error) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const {
      schoolName,
      schoolMobileNo,
      schoolEmail,
      affiliationUpto,
      panNo,
      schoolAddress,
      landMark,
      schoolPincode,
      deliveryAddress,
      deliveryLandMark,
      deliveryPincode,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
      country,
      state,
      city,
      deliveryCountry,
      deliveryState,
      deliveryCity,
    } = req.body;

    const { affiliationCertificate, panFile, profileImage } = req.files || {};

    if (!affiliationCertificate?.[0]) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Affiliation Certificate is required.",
      });
    }

    if (!panFile?.[0]) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "PAN File is required.",
      });
    }

    const profileImagePath =
      profileImage && profileImage[0]
        ? `/Images/SchoolProfile/${profileImage[0].filename}`
        : "/Images/DummyImages/Dummy_Profile.png";

    const affiliationCertificatePath =
      affiliationCertificate[0].mimetype.startsWith("image/")
        ? `/Images/SchoolAffiliationCertificate/${affiliationCertificate[0].filename}`
        : `/Documents/SchoolAffiliationCertificate/${affiliationCertificate[0].filename}`;
    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? `/Images/SchoolPanFile/${panFile[0].filename}`
      : `/Documents/SchoolPanFile/${panFile[0].filename}`;

    const newSchoolRegistration = new SchoolRegistration({
      schoolId,
      schoolName,
      schoolMobileNo,
      schoolEmail,
      affiliationUpto,
      panNo,
      schoolAddress,
      country,
      state,
      city,
      deliveryCountry,
      deliveryState,
      deliveryCity,
      landMark,
      schoolPincode,
      deliveryAddress,
      deliveryLandMark,
      deliveryPincode,
      schoolAlternateContactNo,
      contactPersonName,
      numberOfStudents,
      principalName,
      profileImage: profileImagePath,
      affiliationCertificate: affiliationCertificatePath,
      panFile: panFilePath,
      status: "Completed",
    });

    await newSchoolRegistration.save({ session });

    const schoolDetails = await User.findOne({ schoolId }).session(session);
    const userId = schoolDetails.userId;

    const emailSent = await sendSchoolRegistrationEmail(
      schoolName,
      schoolEmail,
      { userId }
    );

    if (!emailSent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        hasError: true,
        message: "Failed to send registration email.",
      });
    }

    await User.findOneAndUpdate(
      { schoolId, role: "School" },
      { status: "Completed" },
      { new: true, session }
    );

    const senderId = req.user.schoolId;

    const relevantEdprowise = await AdminUser.find({}).session(session);

    await NotificationService.sendNotification(
      "NEW_SCHOOL_REGISTERED",
      relevantEdprowise.map((admin) => ({
        id: admin._id.toString(),
        type: "edprowise",
      })),
      {
        schoolName: newSchoolRegistration.schoolName,
        schoolId: schoolId,

        entityId: newSchoolRegistration._id,
        entityType: "School Registred",
        senderType: "school",
        senderId: senderId,
        metadata: {
          schoolId: schoolId,
          type: "school_registered",
        },
      }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "School Registration created successfully!",
      data: newSchoolRegistration,
      hasError: false,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating School Profile:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        panNo: "PAN",
        schoolMobileNo: "Mobile Number",
        schoolEmail: "email",
      };

      const displayName = fieldNames[field] || field;

      return res.status(400).json({
        hasError: true,
        message: `This ${displayName} (${value}) is already registered. Please use a different ${displayName}.`,
        field: field,
        value: value,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to create School Profile.",
      error: error.message,
    });
  }
}

export default create;
