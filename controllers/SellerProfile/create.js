import SellerProfile from "../../models/SellerProfile.js";
import SellerProfileValidator from "../../validators/Seller/SellerProfile.js";
import Seller from "../../models/Seller.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";

import AdminUser from "../../models/AdminUser.js";
import { NotificationService } from "../../notificationService.js";

import mongoose from "mongoose";

import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sendSellerRegistrationEmail(
  companyName,
  companyEmail,
  userCredentials
) {
  try {
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) throw new Error("SMTP settings not found");

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
    const loginUrl = `${frontendUrl.replace(/\/+$/, "")}/login`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    const credentialsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead><tr><th>Role</th><th>UserID</th></tr></thead>
        <tbody>
          <tr>
            <td style="text-align: center;">Seller</td>
            <td style="text-align: center;">${userCredentials.userId}</td>

          </tr>
        </tbody>
      </table>
    `;

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: companyEmail,
      subject: `Registration Successfull - ${companyName}  `,
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
                        .fw-bold{
                        font-weight: bold;
                        }  
                        .note-email{
                          font-size: 9px;
                          color: #4a5568;
                         }
                        
                        .note-content{
                            padding: 0px 30px;
                            text-align: center;
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
                            <p class="message fw-bold">Dear ${companyName},</p>
                            
                            <p class="message">Welcome to the ${
                              smtpSettings.mailFromName
                            },</p>
                            <p class="message">We’re pleased to inform you that the seller account for ${companyName} has been successfully created.</p>

                            <!-- User Details Box -->
                            <p class="message">The login details are: </p>
                            
                            ${credentialsHtml}
                
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
    await transporter.sendMail(mailOptions);

    console.log("Seller registration email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending registration email:", error);
    return false;
  }
}

async function create(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to create a seller profile.",
      });
    }

    const { error } =
      SellerProfileValidator.SellerProfileCreateValidator.validate(req.body);

    if (error?.details?.length) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const {
      companyName,
      companyType,
      gstin,
      pan,
      tan,
      cin,
      address,
      country,
      state,
      city,
      landmark,
      pincode,
      contactNo,
      alternateContactNo,
      emailId,
      accountNo,
      ifsc,
      accountHolderName,
      bankName,
      branchName,
      noOfEmployees,
      ceoName,
      turnover,
      dealingProducts,
    } = req.body;

    const sellerProfileImagePath = "/Images/SellerProfile";
    const sellerProfile =
      req.files && req.files.sellerProfile && req.files.sellerProfile[0]
        ? `${sellerProfileImagePath}/${req.files.sellerProfile[0].filename}`
        : "/Images/DummyImages/Dummy_Profile.png";

    const signatureImagePath = "/Images/SellerSignature";
    const signature =
      req.files && req.files.signature && req.files.signature[0]
        ? `${signatureImagePath}/${req.files.signature[0].filename}`
        : null;

    const panFile = req.files && req.files.panFile ? req.files.panFile : null;
    const gstFile = req.files && req.files.gstFile ? req.files.gstFile : null;
    const tanFile = req.files && req.files.tanFile ? req.files.tanFile : null;
    const cinFile = req.files && req.files.cinFile ? req.files.cinFile : null;

    if (!signature || !signature[0]) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Signature is required.",
      });
    }

    if (!panFile || !panFile[0]) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Seller PAN File is required.",
      });
    }

    if (!gstFile || !gstFile[0]) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Seller GST File is required.",
      });
    }

    const panFilePath = panFile[0].mimetype.startsWith("image/")
      ? `/Images/SellerPanFile/${panFile[0].filename}`
      : `/Documents/SellerPanFile/${panFile[0].filename}`;
    const gstFilePath = gstFile[0].mimetype.startsWith("image/")
      ? `/Images/SellerGstFile/${gstFile[0].filename}`
      : `/Documents/SellerGstFile/${gstFile[0].filename}`;
    const tanFilePath =
      tanFile && tanFile[0].mimetype.startsWith("image/")
        ? `/Images/SellerTanFile/${tanFile[0].filename}`
        : tanFile
        ? `/Documents/SellerTanFile/${tanFile[0].filename}`
        : null;
    const cinFilePath =
      cinFile && cinFile[0].mimetype.startsWith("image/")
        ? `/Images/SellerCinFile/${cinFile[0].filename}`
        : cinFile
        ? `/Documents/SellerCinFile/${cinFile[0].filename}`
        : null;

    const seller = await Seller.findOne({ _id: sellerId })
      .select("randomId")
      .session(session);

    if (!seller) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Seller not found.",
      });
    }

    const newSellerProfile = new SellerProfile({
      randomId: seller.randomId,
      sellerId,
      companyName,
      companyType,
      gstin,
      pan,
      tan,
      cin,
      address,
      country,
      state,
      city,
      landmark,
      pincode,
      contactNo,
      alternateContactNo,
      emailId,
      sellerProfile,
      signature,
      panFile: panFilePath,
      gstFile: gstFilePath,
      tanFile: tanFilePath,
      cinFile: cinFilePath,
      accountNo,
      ifsc,
      accountHolderName,
      bankName,
      branchName,
      noOfEmployees,
      ceoName,
      turnover,
      dealingProducts,
      status: "Completed",
    });

    const SellerDetails = await Seller.findById(sellerId).session(session);

    await newSellerProfile.save({ session });

    const emailSent = await sendSellerRegistrationEmail(companyName, emailId, {
      userId: SellerDetails.userId,
    });

    if (!emailSent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        hasError: true,
        message: "Failed to send registration email.",
      });
    }

    const updatedSeller = await Seller.findOneAndUpdate(
      { _id: sellerId },
      { status: "Completed" },
      { new: true, session }
    );

    if (!updatedSeller) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Seller not found. Failed to update status.",
      });
    }

    const randomId = newSellerProfile.randomId;
    const senderId = req.user.id;

    const relevantEdprowise = await AdminUser.find({}).session(session);

    await NotificationService.sendNotification(
      "NEW_SELLER_REGISTERED",
      relevantEdprowise.map((admin) => ({
        id: admin._id.toString(),
        type: "edprowise",
      })),
      {
        companyName: newSellerProfile.companyName,
        randomId: randomId,
        entityId: newSellerProfile._id,
        entityType: "Seller Registred",
        senderType: "seller",
        senderId: senderId,
        metadata: {
          sellerId: senderId,
          type: "seller_registered",
        },
      }
    );
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: "Seller profile created successfully.",
      data: newSellerProfile,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating Seller Profile:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      const fieldNames = {
        gstin: "GSTIN",
        pan: "PAN",
        contactNo: "contact number",
        emailId: "email",
        accountNo: "account number",
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
      message: "Failed to create Seller Profile.",
      error: error.message,
    });
  }
}

export default create;
