// import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
// import QuoteProposal from "../../models/QuoteProposal.js";
// import OrderFromBuyer from "../../models/OrderFromBuyer.js";
// import QuoteRequest from "../../models/QuoteRequest.js";
// import School from "../../models/School.js";
// import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
// import SellerProfile from "../../models/SellerProfile.js";
// import nodemailer from "nodemailer";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import mongoose from "mongoose";
// import SubmitQuote from "../../models/SubmitQuote.js";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// import invoiceForBuyerPDFRequirementsForEmail from "../PDFForFrontend/invoiceForBuyerPDFRequirements.js";

// async function sendSchooldeliverdEmail({
//   schoolDetails,
//   productDetails,
//   deliveryDetails,
//   sellerId,
// }) {
//   try {
//     // 1. SMTP settings
//     const smtpSettings = await SMTPEmailSetting.findOne();
//     if (!smtpSettings) {
//       console.error("SMTP settings not found");
//       return false;
//     }

//     const pdfResult = await invoiceForBuyerPDFRequirementsForEmail({
//       sellerId,
//       enquiryNumber: deliveryDetails.enquiryNumber,
//       schoolId: schoolDetails.schoolId,
//     });

//     if (pdfResult.hasError) {
//       return pdfResult;
//     }

//     // 3. Nodemailer setup
//     const transporter = nodemailer.createTransport({
//       host: smtpSettings.mailHost,
//       port: smtpSettings.mailPort,
//       secure: smtpSettings.mailEncryption === "SSL",
//       auth: {
//         user: smtpSettings.mailUsername,
//         pass: smtpSettings.mailPassword,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });

//     const logoImagePath = path.join(
//       __dirname,
//       "../../Images/edprowiseLogoImages/EdProwiseNewLogo.png"
//     );

//     if (!fs.existsSync(logoImagePath)) {
//       console.error("Logo not found at:", logoImagePath);
//       return { hasError: true, message: "Logo file not found" };
//     }
//     // Read logo as base64 for fallback
//     const logoBase64 = fs.readFileSync(logoImagePath, { encoding: "base64" });
//     const base64Src = `data:image/png;base64,${logoBase64}`;

//     const attachments = [
//       {
//         filename: "logo.png",
//         path: logoImagePath,
//         cid: "edprowiselogo@company",
//         contentDisposition: "inline",
//         headers: {
//           "Content-ID": "<edprowiselogo@company>",
//         },
//       },
//       {
//         filename: `Invoice_${deliveryDetails.enquiryNumber}.pdf`,
//         path: pdfResult.pdfPath,
//         contentType: "application/pdf",
//       },
//     ];

//     const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
//     const viewQuoteUrl = `${frontendUrl.replace(
//       /\/+$/,
//       ""
//     )}/school-dashboard/procurement-services/track-order-history`;
//     const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

//     // Check if productDetails.products exists and is an array

//     const quoteDetailsHtml = `
//       <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Sub Category</th>
//             <th>Quantity</th>
//             <th>Rate</th>
//             <th>Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${productDetails
//             .map(
//               (product, index) => `
//             <tr>
//               <td style="text-align: center;">${index + 1}</td>
//               <td style="text-align: center;">${
//                 product.subcategoryName || "-"
//               }</td>
//               <td style="text-align: center;">${product.quantity || "-"}</td>
//               <td style="text-align: center;">${product.finalRate || "-"}</td>
//               <td style="text-align: center;">${product.totalAmount || "-"}</td>
//             </tr>
//           `
//             )
//             .join("")}
//         </tbody>
//       </table>
//     `;
//     // 6. Create deliveryDetailsHtml
//     const deliveryDetailsHtml = `
//       <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
//         <tr><th>Address</th>  <td>${
//           deliveryDetails.deliveryAddress || "-"
//         }</td>  </tr>
//         <tr><th>Location</th> <td>${
//           deliveryDetails.deliveryLocation || "-"
//         }</td> </tr>
//         <tr><th>Landmark</th> <td>${
//           deliveryDetails.deliveryLandMark || "-"
//         }</td> </tr>
//         <tr><th>Pincode</th>  <td>${
//           deliveryDetails.deliveryPincode || "-"
//         }</td>  </tr>
//         <tr><th>Expected Delivery Date</th><td>${
//           deliveryDetails.expectedDeliveryDate || "-"
//         }</td></tr>
//       </table>
//     `;
//     const mailOptions = {
//       from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
//       to: schoolDetails.schoolEmail,
//       subject: `Order Delivered #${deliveryDetails.enquiryNumber}`,
//       html: `
//               <!DOCTYPE html>
//                 <html>
//                 <head>
//                     <meta charset="UTF-8">
//                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                     <style type="text/css">
//                         /* Base Styles */
//                         body, html {
//                             margin: 0;
//                             padding: 0;
//                             font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//                             line-height: 1.6;
//                             color: #333333;
//                         }

//                        .outer-div{
//                           border: 1px solid transparent;
//                           background-color: #f1f1f1;
//                         }

//                         /* Email Container */
//                         .email-container {
//                             max-width: 600px;
//                             margin: 30px auto;
//                             background: #ffffff;
//                             border-radius: 8px;
//                             overflow: hidden;
//                             box-shadow: rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px;
//                         }

//                         /* Header Section */
//                         .header {
//                             background: #c2e7ff;
//                             padding: 20px 20px;
//                             text-align: center;
//                             color: #333333;
//                             box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
//                         }

//                         .logo {
//                             width: 250px;
//                             height: auto;
//                             display: block;
//                             margin: 0 auto;
//                             -ms-interpolation-mode: bicubic;
//                         }

//                         .welcome-heading {
//                             font-size: 24px;
//                             font-weight: 600;
//                             margin: 0;
//                             color: black;
//                         }

//                         /* Content Section */
//                         .content {
//                             padding: 30px;
//                         }
//                         .heading{
//                         color: #000000;
//                         font-size: 17px;
//                         }
//                         .message {
//                             font-size: 16px;
//                             color: #4a5568;
//                         }

//                         /* User Details Box */
//                         .center-text {
//                           text-align: center;
//                         }

//                         .detail-item {
//                             margin-bottom: 12px;
//                             display: flex;
//                         }

//                         .detail-value {
//                             color: #4a5568;
//                         }

//                         /* Action Button */
//                         .action-button {
//                             display: inline-block;
//                             background: #04d3d4;
//                             color: white !important;
//                             text-decoration: none;
//                             padding: 12px 30px;
//                             border-radius: 4px;
//                             font-weight: 600;
//                             margin: 5px 0 20px ;
//                             text-align: center;
//                         }

//                         /* Footer */
//                         .footer {
//                             text-align: center;
//                             padding: 20px;
//                             background: #a9fffd;
//                             font-size: 14px;
//                             color: #718096;
//                         }

//                         .signature {
//                             margin-top: 25px;
//                             padding-top: 25px;
//                             border-top: 1px solid #e2e8f0;
//                         }
//                         .contact-text{
//                           color: #0000FF;
//                         }

//                         /* Responsive */
//                         @media only screen and (max-width: 600px) {
//                             .email-container {
//                                 border-radius: 0;
//                                 margin: 0px auto;
//                             }
//                             .logo {
//                                 width: 200px;
//                             }
//                             .content {
//                                 padding: 20px;
//                             }

//                         }
//                     </style>
//                 </head>
//                 <body>
//                 <div class="outer-div">
//                     <div class="email-container">
//                         <!-- Header with Logo -->
//                         <div class="header">
//                             <div class="logo-container">

//                            <img src="cid:edprowiselogo@company"
//                          alt="EdProwise Logo"
//                          class="logo"
//                          style="width:250px;height:auto;display:block;">
//                             </div>

//                         </div>

//                         <!-- Main Content -->
//                         <div class="content">
//                             <p class="message">Dear ${
//                               schoolDetails.schoolName
//                             },</p>

//                             <p class="message">We are pleased to inform you that your order has been successfully delivered.</p>
//                             <p class="message">Your order details are as follows:</p>

//                             <h3 class="heading">Enquiry Number: ${
//                               deliveryDetails.enquiryNumber
//                             }</h3>

//                             <!-- Order Details Box -->
//                             ${quoteDetailsHtml}

//                             <h4>Delivery Information</h4>
//                             ${deliveryDetailsHtml}

//                             <!-- Action Button -->
//                             <p class="message">You can view your order details by clicking the button below:</p>
//                             <div style="text-align: center;">
//                                 <a href="${viewQuoteUrl}" class="action-button">View Order</a>
//                             </div>

//                             <p class="message">Please <a href="${contactUrl}" class="contact-text">contact us</a> if you have any questions or feedback.</p>

//                             <!-- Signature -->
//                             <div class="signature">
//                                 <p>Best regards,</p>
//                                 <p><strong>${
//                                   smtpSettings.mailFromName
//                                 } Team</strong></p>
//                             </div>
//                         </div>

//                         <!-- Footer -->
//                         <div class="footer">
//                             <p>All Copyright © ${new Date().getFullYear()} EdProwise Tech PVT LTD. All Rights Reserved.</p>
//                         </div>
//                     </div>
//                   </div>
//                 </body>
//                 </html>
//             `,
//       attachments: attachments,
//     };

//     await transporter.sendMail(mailOptions);

//     if (pdfAttachment?.cleanup) {
//       pdfAttachment.cleanup();
//     }

//     console.log("order delivery email sent successfully");
//     return { hasError: false, message: "Email sent successfully." };
//   } catch (error) {
//     console.error("Error sending quote delivery email:", error);
//     return {
//       hasError: true,
//       message: "Email is not proper, we cannot send the email.",
//     };
//   }
// }

// async function sendEmailsToSellers({
//   sellerDetails,
//   productDetails,
//   deliveryDetails,
// }) {
//   try {
//     const smtpSettings = await SMTPEmailSetting.findOne();
//     if (!smtpSettings) {
//       return { hasError: true, message: "SMTP settings not found" };
//     }

//     const transporter = nodemailer.createTransport({
//       host: smtpSettings.mailHost,
//       port: smtpSettings.mailPort,
//       secure: smtpSettings.mailEncryption === "SSL",
//       auth: {
//         user: smtpSettings.mailUsername,
//         pass: smtpSettings.mailPassword,
//       },
//       tls: { rejectUnauthorized: false },
//     });

//     const logoImagePath = path.join(
//       __dirname,
//       "../../Images/edprowiseLogoImages/EdProwiseNewLogo.png"
//     );

//     if (!fs.existsSync(logoImagePath)) {
//       console.error("Logo not found at:", logoImagePath);
//       return { hasError: true, message: "Logo file not found" };
//     }

//     // Read logo as base64 for fallback
//     const logoBase64 = fs.readFileSync(logoImagePath, { encoding: "base64" });
//     const base64Src = `data:image/png;base64,${logoBase64}`;

//     const attachments = [
//       {
//         filename: "logo.png",
//         path: logoImagePath,
//         cid: "edprowiselogo@company",
//         contentDisposition: "inline",
//         headers: {
//           "Content-ID": "<edprowiselogo@company>",
//         },
//       },
//     ];

//     const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
//     const viewQuoteUrl = `${frontendUrl.replace(
//       /\/+$/,
//       ""
//     )}/seller-dashboard/procurement-services/track-order-history`;
//     const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

//     const productHtml = `
//     <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
//       <thead>
//         <tr>
//           <th>S.No</th>
//           <th>Sub Category</th>
//           <th>Quantity</th>
//           <th>Rate</th>
//           <th>Total</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${productDetails
//           .map(
//             (product, index) => `
//           <tr>
//             <td style="text-align: center;">${index + 1}</td>
//             <td style="text-align: center;">${
//               product.subcategoryName || "-"
//             }</td>
//             <td style="text-align: center;">${product.quantity || "-"}</td>
//             <td style="text-align: center;">${product.finalRate || "-"}</td>
//             <td style="text-align: center;">${product.totalAmount || "-"}</td>
//           </tr>
//         `
//           )
//           .join("")}
//       </tbody>
//     </table>
//   `;

//     const deliveryDetailsHtml = `
//     <h3>Delivery Information</h3>
//     <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 10px;">
//       <tr>
//         <th style="width: 30%;">Address</th>
//         <td>${deliveryDetails.deliveryAddress || "-"}</td>
//       </tr>
//       <tr>
//         <th>Location</th>
//         <td>${deliveryDetails.deliveryLocation || "-"}</td>
//       </tr>
//       <tr>
//         <th>Landmark</th>
//         <td>${deliveryDetails.deliveryLandMark || "-"}</td>
//       </tr>
//       <tr>
//         <th>Pincode</th>
//         <td>${deliveryDetails.deliveryPincode || "-"}</td>
//       </tr>
//       <tr>
//         <th>Expected Delivery Date</th>
//         <td>${deliveryDetails.expectedDeliveryDate || "-"}</td>
//       </tr>
//     </table>
//   `;
//     // 8. Send email

//     const mailOptions = {
//       from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
//       to: sellerDetails.emailId,
//       subject: "Order Delivered Successfully",
//       html: `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <style type="text/css">
//                         /* Base Styles */
//                         body, html {
//                             margin: 0;
//                             padding: 0;
//                             font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//                             line-height: 1.6;
//                             color: #333333;
//                         }

//                        .outer-div{
//                           border: 1px solid transparent;
//                           background-color: #f1f1f1;
//                         }

//                         /* Email Container */
//                         .email-container {
//                             max-width: 600px;
//                             margin: 30px auto;
//                             background: #ffffff;
//                             border-radius: 8px;
//                             overflow: hidden;
//                             box-shadow: rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px;
//                         }

//                         /* Header Section */
//                         .header {
//                             background: #c2e7ff;
//                             padding: 20px 20px;
//                             text-align: center;
//                             color: #333333;
//                             box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
//                         }

//                         .logo {
//                             width: 250px;
//                             height: auto;
//                             display: block;
//                             margin: 0 auto;
//                             -ms-interpolation-mode: bicubic;
//                         }

//                         .welcome-heading {
//                             font-size: 24px;
//                             font-weight: 600;
//                             margin: 0;
//                             color: black;
//                         }

//                         /* Content Section */
//                         .content {
//                             padding: 30px;
//                         }
//                         .heading{
//                         color: #000000;
//                         font-size: 17px;
//                         }
//                         .message {
//                             font-size: 16px;
//                             color: #4a5568;
//                         }

//                         /* User Details Box */
//                         .center-text {
//                           text-align: center;
//                         }

//                         .detail-item {
//                             margin-bottom: 12px;
//                             display: flex;
//                         }

//                         .detail-value {
//                             color: #4a5568;
//                         }

//                         /* Action Button */
//                         .action-button {
//                             display: inline-block;
//                             background: #04d3d4;
//                             color: white !important;
//                             text-decoration: none;
//                             padding: 12px 30px;
//                             border-radius: 4px;
//                             font-weight: 600;
//                             margin: 5px 0 20px ;
//                             text-align: center;
//                         }

//                         /* Footer */
//                         .footer {
//                             text-align: center;
//                             padding: 20px;
//                             background: #a9fffd;
//                             font-size: 14px;
//                             color: #718096;
//                         }

//                         .signature {
//                             margin-top: 25px;
//                             padding-top: 25px;
//                             border-top: 1px solid #e2e8f0;
//                         }
//                         .contact-text{
//                           color: #0000FF;
//                         }

//                         /* Responsive */
//                         @media only screen and (max-width: 600px) {
//                             .email-container {
//                                 border-radius: 0;
//                                  margin: 0px auto;
//                             }
//                             .logo {
//                                 width: 200px;
//                             }
//                             .content {
//                                 padding: 20px;
//                             }

//                         }
//                     </style>
//             </head>
//             <body>
//             <div class="outer-div">
//                 <div class="email-container">
//                     <!-- Header with Logo -->
//                     <div class="header">
//                         <div class="logo-container">
//                             <img src="cid:edprowiselogo@company" alt="EdProwise Logo" class="logo" style="width:250px;height:auto;display:block;">
//                         </div>
//                     </div>

//                     <!-- Main Content -->
//                     <div class="content">
//                         <p class="message">Dear ${
//                           sellerDetails.companyName
//                         },</p>

//                         <p class="message">We are pleased to inform you that your order has been successfully delivered to the customer.</p>
//                         <p class="message">Order details are as follows:</p>

//                         <h3>Enquiry Number: ${
//                           deliveryDetails.enquiryNumber
//                         }</h3>

//                         <!-- Order Details Box -->
//                         ${productHtml}

//                         ${deliveryDetailsHtml}

//                         <!-- Action Button -->
//                         <p class="message">You can view the order details by clicking the button below:</p>
//                         <div style="text-align: center;">
//                             <a href="${viewQuoteUrl}" class="action-button">View Order</a>
//                         </div>

//                         <p class="message">Please <a href="${contactUrl}" class="contact-text">contact us</a> if you have any questions.</p>

//                         <!-- Signature -->
//                         <div class="signature">
//                             <p>Best regards,</p>
//                             <p><strong>${
//                               smtpSettings.mailFromName
//                             } Team</strong></p>
//                         </div>
//                     </div>

//                     <!-- Footer -->
//                     <div class="footer">
//                         <p>All Copyright © ${new Date().getFullYear()} EdProwise Tech PVT LTD. All Rights Reserved.</p>
//                     </div>
//                 </div>
//               </div>
//             </body>
//             </html>
//           `,
//       attachments: attachments,
//     };

//     await transporter.sendMail(mailOptions);

//     console.log(
//       `Order delivered email sent successfully to seller ${sellerDetails.name}`
//     );

//     return {
//       hasError: false,
//       message: "Emails sent to sellers.",
//     };
//   } catch (error) {
//     console.error("Error in sendEmailsToSellers:", error);
//     return { hasError: true, message: "Failed to send seller emails." };
//   }
// }

// async function updateStatus(req, res) {
//   try {
//     const { enquiryNumber, sellerId } = req.query;
//     const { supplierStatus } = req.body;

//     if (!enquiryNumber) {
//       return res.status(400).json({
//         hasError: true,
//         message: "enquiryNumber is required",
//       });
//     }

//     if (!sellerId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "SellerId is required",
//       });
//     }

//     const allowedStatuses = [
//       "Work In Progress",
//       "Ready For Transit",
//       "In-Transit",
//       "Delivered",
//     ];

//     if (!allowedStatuses.includes(supplierStatus)) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Invalid Supplier Status. Allowed values: ${allowedStatuses.join(
//           ", "
//         )}`,
//       });
//     }

//     // Find and update all related documents in a transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       const existingOrder = await QuoteProposal.findOneAndUpdate(
//         { sellerId, enquiryNumber },
//         {
//           supplierStatus,
//           edprowiseStatus: supplierStatus,
//           buyerStatus: supplierStatus,
//         },
//         { new: true, session }
//       );

//       if (!existingOrder) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(404).json({
//           hasError: true,
//           message: "Order not found for the given enquiryNumber",
//         });
//       }

//       const existingSubmitQuote = await SubmitQuote.findOneAndUpdate(
//         { sellerId, enquiryNumber },
//         { venderStatusFromBuyer: supplierStatus },
//         { new: true, session }
//       );

//       if (!existingSubmitQuote) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(404).json({
//           hasError: true,
//           message: "Submit Quote not found for the given enquiryNumber",
//         });
//       }

//       if (supplierStatus === "Ready For Transit") {
//         await OrderDetailsFromSeller.findOneAndUpdate(
//           { enquiryNumber, sellerId },
//           { invoiceDate: new Date() },
//           { new: true, session }
//         );
//       }

//       if (supplierStatus === "Delivered") {
//         const productDetails = await OrderFromBuyer.find({
//           enquiryNumber,
//           sellerId,
//         });

//         const schoolId = productDetails[0].schoolId;
//         const deliveryDetails = await QuoteRequest.findOne({
//           enquiryNumber,
//           $or: [{ schoolId: schoolId }, { sellerId: sellerId }],
//         });

//         const sellerDetails = await SellerProfile.findOne({ sellerId });
//         const schoolDetails = await School.findOne({ schoolId });
//         console.log("school Details are", schoolDetails);

//         await sendSchooldeliverdEmail({
//           schoolDetails,
//           productDetails,
//           deliveryDetails,
//           sellerId,
//         });
//         await sendEmailsToSellers({
//           sellerDetails,
//           productDetails,
//           deliveryDetails,
//         });
//       }

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//         hasError: false,
//         message: "Order status updated successfully.",
//         data: existingOrder,
//       });
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error updating Order Status:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal server error.",
//     });
//   }
// }

// export default updateStatus;

import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import School from "../../models/School.js";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import SellerProfile from "../../models/SellerProfile.js";
import SubmitQuote from "../../models/SubmitQuote.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import EdprowiseProfile from "../../models/EdprowiseProfile.js";
import invoiceForBuyerPDFRequirementsForEmail from "../PDFForFrontend/invoiceForBuyerPDFRequirementsForEmail.js";
import invoiceForEdprowisePDFRequirementsForMail from "../PDFForFrontend/invoiceForEdprowisePDFRequirementsForMail.js";
// import axios from 'axios';
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sendSchooldeliverdEmail({
  schoolDetails,
  sellerDetails,
  productDetails,
  deliveryDetails,
  sellerId,
}) {
  let pdfResult;
  let edPdfResult;
  let pdfAttachment = null;
  let edPdfAttachment = null;
  
  try {
    // 1. SMTP settings
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      console.error("SMTP settings not found");
      return false;
    }
    

    pdfResult = await invoiceForBuyerPDFRequirementsForEmail({
      sellerId,
      enquiryNumber: deliveryDetails.enquiryNumber,
      schoolId: schoolDetails.schoolId,
    });

     edPdfResult = await invoiceForEdprowisePDFRequirementsForMail({
      sellerId,
      enquiryNumber: deliveryDetails.enquiryNumber,
      schoolId: schoolDetails.schoolId,
    });

    if (pdfResult.hasError || edPdfResult.hasError) {
      return {
        hasError: true,
        message: pdfResult.hasError ? pdfResult.message : edPdfResult.message,
      };
    }

    pdfAttachment = {
      pdfPath: pdfResult.pdfPath,
      cleanup: () => {
        try {
          if (fs.existsSync(pdfResult.pdfPath)) {
            fs.unlinkSync(pdfResult.pdfPath);
          }
        } catch (err) {
          console.error("Error cleaning up buyer PDF:", err);
        }
      }
    };

    edPdfAttachment = {
      pdfPath: edPdfResult.pdfPath,
      cleanup: () => {
        try {
          if (fs.existsSync(edPdfResult.pdfPath)) {
            fs.unlinkSync(edPdfResult.pdfPath);
          }
        } catch (err) {
          console.error("Error cleaning up Edprowise PDF:", err);
        }
      }
    };


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
        cid: "edprowiselogo@company",
        contentDisposition: "inline",
        headers: {
          "Content-ID": "<edprowiselogo@company>",
        },
      },
      {
        filename: `Invoice_${deliveryDetails.enquiryNumber}.pdf`,
        path: pdfResult.pdfPath,
        contentType: "application/pdf",
      },
    ];

    const edprowiseAttachments = [
      {
        filename: "logo.png",
        path: logoImagePath,
        cid: "edprowiselogo@company",
        contentDisposition: "inline",
        headers: {
          "Content-ID": "<edprowiselogo@company>",
        },
      },
      {
        filename: `Invoice_${deliveryDetails.enquiryNumber}_Buyer.pdf`,
        path: pdfResult.pdfPath,
        contentType: "application/pdf",
      },
      {
        filename: `Invoice_${deliveryDetails.enquiryNumber}_Edprowise.pdf`,
        path: edPdfResult.pdfPath,
        contentType: "application/pdf",
      },
    ];

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const viewQuoteUrl = `${frontendUrl.replace(
      /\/+$/,
      ""
    )}/school-dashboard/procurement-services/track-order-history`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    // Check if productDetails.products exists and is an array
          const orderNumber = productDetails[0]?.orderNumber || 'N/A';
    const quoteDetailsHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Sub Category</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${productDetails
            .map(
              (product, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: center;">${
                product.subcategoryName || "-"
              }</td>
              <td style="text-align: center;">${product.quantity || "-"}</td>
              <td style="text-align: center;">${product.finalRate || "-"}</td>
              <td style="text-align: center;">${product.totalAmount || "-"}</td>
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
          deliveryDetails.deliveryAddress || "-"
        }</td>  </tr>
        <tr><th>Location</th> <td>${
          deliveryDetails.deliveryLocation || "-"
        }</td> </tr>
        <tr><th>Landmark</th> <td>${
          deliveryDetails.deliveryLandMark || "-"
        }</td> </tr>
        <tr><th>Pincode</th>  <td>${
          deliveryDetails.deliveryPincode || "-"
        }</td>  </tr>
        <tr><th>Expected Delivery Date</th><td>${
          deliveryDetails.expectedDeliveryDate || "-"
        }</td></tr>        
      </table>
    `;

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolDetails.schoolEmail,
      subject: `Order Delivered Successfully - ${orderNumber}`,
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
                            <p class="message fw-bold">Dear ${
                              schoolDetails.schoolName
                            },</p>
                            
                            <p class="message">We’re happy to inform you that your order has been successfully delivered. Below are the full details:</p>
                            <p class="message">Your order details are as follows:</p>

                            <p class="message">Enquiry Number: <span class="fw-bold">${deliveryDetails.enquiryNumber}</span></p>

                            <!-- Order Details Box -->
                            ${quoteDetailsHtml}

                            <h4>Delivery Information</h4>
                            ${deliveryDetailsHtml}

                            <!-- Action Button -->
                            <p class="message">To review your order or download any related documents, please click below:</p>
                            <div style="text-align: center;">
                                <a href="${viewQuoteUrl}" class="action-button">View Order</a>
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

    const edprowiseMailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: "ujadhav482@gmail.com", // Use configured admin email
      subject: `Order Delivered - ${orderNumber}`,
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
                      <p class="message fw-bold">Admin Team,</p>
                      
                      <p class="message">An order has been successfully delivered with the following details:</p>
                      
                      <p class="message">School: <span class="fw-bold">${schoolDetails.schoolName}</span></p>
                      <p class="message">Order Number: <span class="fw-bold">${orderNumber}</span></p>
                      <p class="message">Enquiry Number: <span class="fw-bold">${deliveryDetails.enquiryNumber}</span></p>
                      <p class="message">Seller: <span class="fw-bold">${sellerDetails.companyName}</span></p>
  
                      <!-- Order Summary -->
                      <h4>Order Summary</h4>
                      ${quoteDetailsHtml}
  
                      <h4>Delivery Information</h4>
                      ${deliveryDetailsHtml}
  
                      <p class="message">Please find attached both the buyer and Edprowise invoices for your records.</p>
                      
                      <!-- Signature -->
                      <div class="signature">
                          <p>System Notification</p>
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
      attachments: edprowiseAttachments,
    };

    await transporter.sendMail(mailOptions);
    await transporter.sendMail(edprowiseMailOptions);

    if (pdfAttachment?.cleanup) {
      pdfAttachment.cleanup();
    }

    console.log("order delivery email sent successfully");
    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending quote delivery email:", error);
    return {
      hasError: true,
      message: "Email is not proper, we cannot send the email.",
    };
  }
}

async function sendEmailsToSellers({
  sellerDetails,
  productDetails,
  deliveryDetails,
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
        cid: "edprowiselogo@company",
        contentDisposition: "inline",
        headers: {
          "Content-ID": "<edprowiselogo@company>",
        },
      },
    ];

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const viewQuoteUrl = `${frontendUrl.replace(
      /\/+$/,
      ""
    )}/seller-dashboard/procurement-services/track-order-history`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;
    const orderNumber = productDetails[0]?.orderNumber || 'N/A';
    const productHtml = `
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Sub Category</th>
          <th>Quantity</th>
          <th>Rate</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${productDetails
          .map(
            (product, index) => `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td style="text-align: center;">${
              product.subcategoryName || "-"
            }</td>
            <td style="text-align: center;">${product.quantity || "-"}</td>
            <td style="text-align: center;">${product.finalRate || "-"}</td>
            <td style="text-align: center;">${product.totalAmount || "-"}</td>
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
        <td>${deliveryDetails.deliveryAddress || "-"}</td>
      </tr>
      <tr>
        <th>Location</th>
        <td>${deliveryDetails.deliveryLocation || "-"}</td>
      </tr>
      <tr>
        <th>Landmark</th>
        <td>${deliveryDetails.deliveryLandMark || "-"}</td>
      </tr>
      <tr>
        <th>Pincode</th>
        <td>${deliveryDetails.deliveryPincode || "-"}</td>
      </tr>
      <tr>
        <th>Expected Delivery Date</th>
        <td>${deliveryDetails.expectedDeliveryDate || "-"}</td>
      </tr>
    </table>
  `;
    // 8. Send email

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: sellerDetails.emailId,
      subject: `Order Delivered Successfully - ${orderNumber}`,
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
                        .fw-bold{
                          font-weight: bold;
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
                       .note-email{
                          font-size: 9px;
                          color: #4a5568;
                         }
                        
                        .note-content{
                            padding: 0px 30px;
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
                            <img src="cid:edprowiselogo@company" alt="EdProwise Logo" class="logo" style="width:250px;height:auto;display:block;">
                        </div>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="content">
                        <p class="message fw-bold">Dear ${
                          sellerDetails.companyName
                        },</p>
                        
                        <p class="message">We’re delighted to let you know that your order has been successfully delivered to the customer. Below are the full details:</p>
                        <p class="message">Order details are as follows:</p>
    
                        <h3>Enquiry Number: ${
                          deliveryDetails.enquiryNumber
                        }</h3>
    
                        <!-- Order Details Box -->
                        ${productHtml}
    
                        ${deliveryDetailsHtml}
    
                        <!-- Action Button -->
                        <p class="message">To review your order, please click below:</p>
                        <div style="text-align: center;">
                            <a href="${viewQuoteUrl}" class="action-button">View Order</a>
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

    console.log(
      `Order delivered email sent successfully to seller ${sellerDetails.name}`
    );

    return {
      hasError: false,
      message: "Emails sent to sellers.",
    };
  } catch (error) {
    console.error("Error in sendEmailsToSellers:", error);
    return { hasError: true, message: "Failed to send seller emails." };
  }
}

async function updateStatus(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;
    const { supplierStatus } = req.body;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber is required",
      });
    }

    if (!sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "SellerId is required",
      });
    }

    const allowedStatuses = [
      "Work In Progress",
      "Ready For Transit",
      "In-Transit",
      "Delivered",
    ];

    if (!allowedStatuses.includes(supplierStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid Supplier Status. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    // Find and update all related documents in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingOrder = await QuoteProposal.findOneAndUpdate(
        { sellerId, enquiryNumber },
        {
          supplierStatus,
          edprowiseStatus: supplierStatus,
          buyerStatus: supplierStatus,
        },
        { new: true, session }
      );

      if (!existingOrder) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          hasError: true,
          message: "Order not found for the given enquiryNumber",
        });
      }

      const existingSubmitQuote = await SubmitQuote.findOneAndUpdate(
        { sellerId, enquiryNumber },
        { venderStatusFromBuyer: supplierStatus },
        { new: true, session }
      );

      if (!existingSubmitQuote) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          hasError: true,
          message: "Submit Quote not found for the given enquiryNumber",
        });
      }

      if (supplierStatus === "Ready For Transit") {
        await OrderDetailsFromSeller.findOneAndUpdate(
          { enquiryNumber, sellerId },
          { invoiceDate: new Date() },
          { new: true, session }
        );
      }

      if (supplierStatus === "Delivered") {
        const productDetails = await OrderFromBuyer.find({
          enquiryNumber,
          sellerId,
        });

        const schoolId = productDetails[0].schoolId;
        const deliveryDetails = await QuoteRequest.findOne({
          enquiryNumber,
          $or: [{ schoolId: schoolId }, { sellerId: sellerId }],
        });

        const sellerDetails = await SellerProfile.findOne({ sellerId });
        const schoolDetails = await School.findOne({ schoolId });
        console.log("school Details are", schoolDetails);

        await sendSchooldeliverdEmail({
          schoolDetails,
          sellerDetails,
          productDetails,
          deliveryDetails,
          sellerId,
        });

        await sendEmailsToSellers({
          sellerDetails,
          productDetails,
          deliveryDetails,
        });
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        hasError: false,
        message: "Order status updated successfully.",
        data: existingOrder,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error updating Order Status:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateStatus;
