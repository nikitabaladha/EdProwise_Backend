import Product from "../../../models/ProcurementService/Product.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import ProductValidator from "../../../validators/ProcurementService/Product.js";
import AdminUser from "../../../models/AdminUser.js";
import mongoose from "mongoose";

import { NotificationService } from "../../../notificationService.js";

import School from "../../../models/School.js";
import Category from "../../../models/ProcurementService/Category.js";
import SubCategory from "../../../models/ProcurementService/SubCategory.js";
import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../../models/SMTPEmailSetting.js";
import SellerProfile from "../../../models/SellerProfile.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateEnquiryNumber() {
  const prefix = "ENQ";

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // Months are 0-indexed

  // Determine financial year (April to March)
  let financialYearStart, financialYearEnd;
  if (currentMonth >= 4) {
    // April or later - current year to next year (2024-25)
    financialYearStart = currentYear;
    financialYearEnd = currentYear + 1;
  } else {
    // January-March - previous year to current year (2023-24)
    financialYearStart = currentYear - 1;
    financialYearEnd = currentYear;
  }

  const financialYear = `${financialYearStart}-${financialYearEnd
    .toString()
    .slice(-2)}`;

  // Find the last enquiry number for this financial year
  const lastEnquiry = await QuoteRequest.findOne({
    enquiryNumber: new RegExp(`^${prefix}/${financialYear}/`),
  }).sort({ createdAt: -1 });

  let sequenceNumber;
  if (lastEnquiry) {
    // Extract the sequence number from the last enquiry
    const lastSequence = parseInt(lastEnquiry.enquiryNumber.split("/")[2]);
    sequenceNumber = lastSequence + 1;
  } else {
    // First enquiry of this financial year
    sequenceNumber = 1;
  }

  // Format the sequence number with leading zeros
  const formattedSequence = String(sequenceNumber).padStart(4, "0");

  return `${prefix}/${financialYear}/${formattedSequence}`;
}

async function sendSchoolRequestQuoteEmail(
  schoolName,
  schoolEmail,
  usersWithCredentials
) {
  let hasError = false;
  let message = "";

  try {
    // 1. SMTP settings
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      console.error("SMTP settings not found");
      return false;
    }

    // 3. Nodemailer setup
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

    const { enquiryNumber, products, quoteRequest } = usersWithCredentials;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    // const viewQuoteUrl = `${frontendUrl.replace(
    //   /\/+$/,
    //   ""
    // )}/school-dashboard/procurement-services/view-requested-quote`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;
    // const viewQuoteUrl = new URL(
    //   "/school-dashboard/procurement-services/view-requested-quote",
    //   frontendUrl
    // );
    // viewQuoteUrl.searchParams.append('enquiryNumber', enquiryNumber);
    const encodedEnquiry = encodeURIComponent(enquiryNumber);
    const viewQuoteUrl = `${frontendUrl}/school-dashboard/procurement-services/view-requested-quote?enquiryNumber=${encodedEnquiry}`;
    const quoteDetailsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (product, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: center;">${product.subCategoryName}</td>
              <td style="text-align: center;">${product.unit}</td>
              <td style="text-align: center;">${product.quantity}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    // 6. Create deliveryDetailsHtml
    const deliveryDetailsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr><th>Address</th>  <td>${
          quoteRequest.deliveryAddress || "-"
        }</td>  </tr>
        <tr><th>Location</th> <td>${
          quoteRequest.deliveryLocation || "-"
        }</td> </tr>
        <tr><th>Landmark</th> <td>${
          quoteRequest.deliveryLandMark || "-"
        }</td> </tr>
        <tr><th>Pincode</th>  <td>${
          quoteRequest.deliveryPincode || "-"
        }</td>  </tr>
        <tr><th>Expected Delivery Date</th><td>${
          quoteRequest.expectedDeliveryDate || "-"
        }</td></tr>        
      </table>
    `;

    // 8. Send email
    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: `Your Quote Request Submitted - ${enquiryNumber}`,
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
                          font-weight: bold;
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
                            

                            <p class="message">Thank you for your quote request. We have received your quote request and are processing it now.</p>
                            
                            <p class="message">Your quote requested details are as follow : </p>

                            <p class="message">Enquiry Number:<span class="fw-bold">${enquiryNumber}</span></p>

                            <!-- Quote Details Box -->
                            ${quoteDetailsHtml}

                            <h4>Delivery Information</h4>
                            ${deliveryDetailsHtml}

                            <!-- Action Button -->
                            <p class="message">To view your requested quote, please click the button below: </p>
                            <div style="text-align: center;">
                                <a href="${viewQuoteUrl}" class="action-button">View Quote</a>
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

    console.log("Request quote email sent successfully");
    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending quote request email:", error);
    return {
      hasError: true,
      message: "Email is not proper, we cannot send the email.",
    };
  }
}

async function sendEmailsToSellers({
  enrichedProducts,
  newQuoteRequest,
  enquiryNumber,
}) {
  try {
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      return { hasError: true, message: "SMTP settings not found" };
    }

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
    // const viewQuoteUrl = `${frontendUrl.replace(
    //   /\/+$/,
    //   ""
    // )}/seller-dashboard/procurement-services/track-quote`;
    const viewQuoteUrl = new URL(
      "/seller-dashboard/procurement-services/view-requested-quote",
      frontendUrl
    );
    viewQuoteUrl.searchParams.append("enquiryNumber", enquiryNumber);
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    const sellerMap = new Map();
    let totalMatchedSellers = 0;

    for (const product of enrichedProducts) {
      // Corrected query to match dealingProducts structure
      const matchedSellers = await SellerProfile.find({
        "dealingProducts.categoryId": product.categoryId,
        "dealingProducts.subCategoryIds": product.subCategoryId,
      });

      console.log(`Found ${matchedSellers.length} sellers for this product`);
      totalMatchedSellers += matchedSellers.length;

      for (const seller of matchedSellers) {
        const id = seller._id.toString();
        if (!sellerMap.has(id)) {
          sellerMap.set(id, { seller, products: [product] });
        } else {
          sellerMap.get(id).products.push(product);
        }
      }
    }

    // Rest of the function remains the same...
    if (sellerMap.size === 0) {
      return {
        hasError: true,
        message: "No matching sellers found for any products",
      };
    }

    let emailsSent = 0;
    for (const [id, { seller, products }] of sellerMap.entries()) {
      try {
        const productHtml = `
      <table class="lll" border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Category</th>       
            <th>Unit</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (product, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: center;">${product.subCategoryName}</td>
              <td style="text-align: center;">${product.unit}</td>
              <td style="text-align: center;">${product.quantity}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      `;
        const quoteDetailsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (product, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: center;">${product.subCategoryName}</td>
              <td style="text-align: center;">${product.unit}</td>
              <td style="text-align: center;">${product.quantity}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

        const deliveryDetailsHtml = `
          <h3>Delivery Information</h3>
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 10px;">
              <tr>
                <th style="width: 30%;">Address</th>
                <td >${newQuoteRequest.deliveryAddress || "-"}</td>
              </tr>
              <tr>
                <th>Location</th>
                <td>${newQuoteRequest.deliveryLocation || "-"}</td>
              </tr>
              <tr>
                <th>Landmark</th>
                <td>${newQuoteRequest.deliveryLandMark || "-"}</td>
              </tr>
              <tr>
                <th>Pincode</th>
                <td>${newQuoteRequest.deliveryPincode || "-"}</td>
              </tr>
              <tr>
                <th>Expected Delivery Date</th>
                <td>${newQuoteRequest.expectedDeliveryDate || "-"}</td>
              </tr>
            </table>
          `;

        // 8. Send email
        const mailOptions = {
          from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
          to: seller.emailId,
          subject: ` New Quote Request Received – ${enquiryNumber}`,
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

                        .lll{
                          display: none;
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
                        .heading{
                        color: #000000;
                        font-size: 17px;
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
                         font-weight: bold;
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
                            <p class="message fw-bold">Dear Seller,</p>
                            
                            <p class="message">New quote request has been received, Prepared your quote and please Submit Now. Hurry Up !!!</p>
                            <p class="message">Quote requested details are as follow : </p>

                        
<h3 class="message">Enquiry Number:<span class="fw-bold">${enquiryNumber}</span></h3>
                            <!-- Quote Details Box -->
                            ${productHtml}
                            ${quoteDetailsHtml}
                            
                            ${deliveryDetailsHtml}

                            <!-- Action Button -->
                            <p class="message">To view the full quote, please click the button below: </p>
                            <div style="text-align: center;">
                                <a href="${viewQuoteUrl}" class="action-button">View Quote</a>
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
        emailsSent++;
      } catch (emailError) {
        console.error(`Failed to send email to ${seller.emailId}:`, emailError);
      }
    }

    console.log(`Emails sent to ${emailsSent}/${sellerMap.size} sellers.`);
    return {
      hasError: false,
      message: `Emails sent to ${emailsSent} sellers.`,
      stats: {
        totalProducts: enrichedProducts.length,
        totalMatchedSellers,
        emailsSent,
      },
    };
  } catch (error) {
    console.error("Error in sendEmailsToSellers:", error);
    return { hasError: true, message: "Failed to send seller emails." };
  }
}

async function create(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request for a quote.",
      });
    }

    let { products } = req.body;

    if (typeof products === "string") {
      try {
        products = JSON.parse(products);
        console.log("Number of products:", products.length);
      } catch (error) {
        return res.status(400).json({
          hasError: true,
          message: "Invalid products data format.",
        });
      }
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "At least one product must be provided.",
      });
    }

    const uploadedImages = req.files || [];
    const createdEntries = [];

    const enquiryNumber = await generateEnquiryNumber();
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      const { error } = ProductValidator.createProduct.validate({
        schoolId,
        ...product,
      });

      if (error?.details?.length) {
        const errorMessages = error.details
          .map((err) => err.message)
          .join(", ");
        return res.status(400).json({ hasError: true, message: errorMessages });
      }

      const requiredFields = [
        "categoryId",
        "subCategoryId",
        "unit",
        "quantity",
      ];

      for (const field of requiredFields) {
        if (product[field] === undefined || product[field] === null) {
          return res.status(400).json({
            hasError: true,
            message: `Field '${field}' is required`,
          });
        }
      }

      const productImages = [];
      if (req.files) {
        const imageKeys = Object.keys(req.files).filter((key) => {
          for (let j = 0; j <= 4; j++) {
            if (key.startsWith(`products[${i}][productImages][${j}]`))
              return true;
          }
          return false;
        });
        imageKeys.forEach((key) => {
          req.files[key].forEach((file) => {
            productImages.push(`/Images/ProductImage/${file.filename}`);
          });
        });
      }

      const newProduct = new Product({
        schoolId,
        productImages,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        description: product.description || "No description provided",
        unit: product.unit,
        quantity: product.quantity,
        enquiryNumber,
      });

      const savedEntry = await newProduct.save({ session });
      createdEntries.push(savedEntry);
    }

    const {
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryCountry,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
    } = JSON.parse(req.body.data);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deliveryDate = new Date(expectedDeliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);

    if (deliveryDate < today) {
      return res.status(400).json({
        hasError: true,
        message: "Expected delivery date must be today or a future date.",
      });
    }

    const newQuoteRequest = new QuoteRequest({
      schoolId,
      enquiryNumber,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryCountry,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
      buyerStatus: "Quote Requested",
      supplierStatus: "Quote Requested",
      edprowiseStatus: "Quote Requested",
    });

    await newQuoteRequest.save({ session });

    const schoolDetail = await School.findOne({ schoolId }).session(session);
    const schoolEmail = schoolDetail.schoolEmail;
    const schoolName = schoolDetail.schoolName;

    const enrichedProducts = await Promise.all(
      createdEntries.map(async (product) => {
        const category = await Category.findById(product.categoryId)
          .lean()
          .session(session);

        const subCategory = await SubCategory.findById(product.subCategoryId)
          .lean()
          .session(session);

        return {
          ...product.toObject(),
          categoryName: category?.categoryName || "Unknown Category",
          subCategoryName:
            subCategory?.subCategoryName || "Unknown SubCategory",
        };
      })
    );

    await sendSchoolRequestQuoteEmail(schoolName, schoolEmail, {
      enquiryNumber,
      products: enrichedProducts,
      quoteRequest: newQuoteRequest,
    });

    await sendEmailsToSellers({
      enrichedProducts,
      newQuoteRequest,
      enquiryNumber,
    });

    // Find relevant sellers for each product category/subcategory
    const categoryIds = [...new Set(products.map((p) => p.categoryId))];
    const subCategoryIds = [
      ...new Set(products.flatMap((p) => p.subCategoryId)),
    ];

    const relevantSellers = await SellerProfile.find({
      "dealingProducts.categoryId": { $in: categoryIds },
      "dealingProducts.subCategoryIds": { $in: subCategoryIds },
    }).populate("dealingProducts.categoryId dealingProducts.subCategoryIds");

    // Send notifications to relevant school

    await NotificationService.sendNotification(
      "SCHOOL_QUOTE_REQUESTED",
      [
        {
          id: schoolId,
          type: "school",
        },
      ],
      {
        schoolName,
        enquiryNumber,
        entityId: newQuoteRequest._id,
        entityType: "QuoteRequest",
        senderType: "school",
        senderId: schoolId,
        metadata: {
          enquiryNumber: enquiryNumber,
          type: "quote_requested",
        },
      }
    );

    // Send notifications to relevant sellers

    await NotificationService.sendNotification(
      "SELLER_QUOTE_RECEIVED",
      relevantSellers.map((seller) => ({
        id: seller.sellerId.toString(),
        type: "seller",
      })),
      {
        schoolName,
        enquiryNumber,
        entityId: newQuoteRequest._id,
        entityType: "QuoteRequest",
        senderType: "school",
        senderId: schoolId,
        metadata: {
          enquiryNumber: enquiryNumber,
          type: "quote_received",
        },
      }
    );

    // Send notifications to edprowise

    const relevantEdprowise = await AdminUser.find({});

    await NotificationService.sendNotification(
      "EDPROWISE_QUOTE_REQUESTED_FROM_SCHOOL",
      relevantEdprowise.map((admin) => ({
        id: admin._id.toString(),
        type: "edprowise",
      })),
      {
        schoolName,
        enquiryNumber,
        entityId: newQuoteRequest._id,
        entityType: "QuoteRequest",
        senderType: "school",
        senderId: schoolId,
        metadata: {
          enquiryNumber: enquiryNumber,
          type: "quote_received",
        },
      }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: "Quotes and Quote Proposal created successfully.",
      data: {
        products: createdEntries,
        quoteRequest: newQuoteRequest,
      },
    });
  } catch (error) {
    // Only abort transaction if it hasn't been committed yet
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating Product:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default create;
