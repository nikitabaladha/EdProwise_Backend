import mongoose from "mongoose";
import OrderFromBuyer from "../../../models/ProcurementService/OrderFromBuyer.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import Cart from "../../../models/ProcurementService/Cart.js";
import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import AdminUser from "../../../models/AdminUser.js";
import { NotificationService } from "../../../notificationService.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../../models/SMTPEmailSetting.js";
import School from "../../../models/School.js";
import SellerProfile from "../../../models/SellerProfile.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sendSchoolRequestQuoteEmail(
  schoolName,
  schoolEmail,
  orderDetails
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

    const { orderNumber, products } = orderDetails;
    const enquiryNumber =
      products.length > 0 ? products[0].enquiryNumber : "N/A";

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
    const viewQuoteUrl = `${frontendUrl.replace(
      /\/+$/,
      ""
    )}/school-dashboard/procurement-services/view-order-history?orderNumber=${encodeURIComponent(
      orderNumber
    )}`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    const quoteDetailsHtml = `
    <h3 style="font-size: 17px;">Order Details</h3>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th >S.No</th>
          <th >Category</th>
          <th >Quantity</th>
          <th >Rate</th>
        </tr>
      </thead>
      <tbody>
        ${products
          .map(
            (product, index) => `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td style="text-align: center;">${product.subcategoryName}</td>
            <td style="text-align: center;">${product.quantity}</td>
            <td style="text-align: center;">${product.finalRate}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

    // 8. Send email
    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: `Your Order Has Been Placed –${orderNumber}`,
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
                        .note-email{
                          font-size: 9px;
                          color: #4a5568;
                         }
                        
                        .note-content{
                            padding: 0px 30px;
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
                         .fw-bold{
                         font-weight: bold;
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

                           <img src="cid:edprowiselogo@company" 
                         alt="EdProwise Logo" 
                         class="logo"
                         style="width:250px;height:auto;display:block;">
                            </div>
                             
                        </div>
                        
                        <!-- Main Content -->
                        <div class="content">
                            <p class="message fw-bold">Dear ${schoolName},</p>
                            

                            <p class="message">We’re pleased to confirm that your order has been successfully placed and is now being processed.</p>
                            
                            <p class="message">Enquiry Number :<span class="fw-bold"> ${enquiryNumber}</span></p>
                            <p class="message">Order Number :  <span class="fw-bold">${orderNumber}</span></p>

                            <!-- Quote Details Box -->
                            ${quoteDetailsHtml}

                
                            <!-- Action Button -->
                            <p class="message">To view your order details and track its status,please click the button below:</p>
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

async function sendEmailsToSellers(
  sellerName,
  sellerEmail,
  schoolName,
  orderDetails
) {
  try {
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      return { hasError: true, message: "SMTP settings not found" };
    }

    console.log("Setting up email transporter...");
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

    const {
      orderNumber,
      products,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
    } = orderDetails;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const sellerDashboardUrl = `${frontendUrl.replace(
      /\/+$/,
      ""
    )}/seller-dashboard/procurement-services/view-order-history?orderNumber=${encodeURIComponent(
      orderNumber
    )}`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    const enquiryNumber =
      products.length > 0 ? products[0].enquiryNumber : "N/A";

    const productHtml = products
      .map(
        (product, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: center;">${product.subcategoryName}</td>
        <td style="text-align: center;">${product.quantity}</td>
        <td style="text-align: center;">₹${product.finalRate}</td>
        <td style="text-align: center;">₹${product.totalAmount}</td>
      </tr>
    `
      )
      .join("");

    const deliveryDetails = `
      <h3 style="font-size: 17px;">Delivery Information</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr><th>Address</th><td>${deliveryAddress || "-"}</td></tr>
        <tr><th>Location</th><td>${deliveryLocation || "-"}</td></tr>
        <tr><th>Landmark</th><td>${deliveryLandMark || "-"}</td></tr>
        <tr><th>Pincode</th><td>${deliveryPincode || "-"}</td></tr>
        <tr><th>Expected Delivery Date</th><td>${
          expectedDeliveryDate || "-"
        }</td></tr>
      </table>
    `;

    const orderDetailsTable = `
      <h3 style="font-size: 17px;">Ordered Products</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>${productHtml}</tbody>
      </table>
      ${deliveryDetails}
    `;

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: sellerEmail,
      subject: `New Order Received - ${orderNumber}`,
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
                        .note-email{
                          font-size: 9px;
                          color: #4a5568;
                         }
                        
                        .note-content{
                            padding: 0px 30px;
                            text-align: center;
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
                        .fw-bold{
                        font-weight: bold;
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
                            <p class="message fw-bold">Dear ${sellerName},</p>
                            
                            <p class="message">We’re delighted to inform you that ${schoolName}  has accepted your quote proposal and placed an order. Below are the details:</p>
                            
                            <p class="message">Enquiry Number : <span class="fw-bold">${enquiryNumber}</span></p>
                            <p class="message">Order Number :   <span class="fw-bold"> ${orderNumber}</span></p>

                            <!-- Quote Details Box -->
                            ${orderDetailsTable}

                            <!-- Action Button -->
                            <p class="message">To view the full order details, please click the button below: </p>
                            <div style="text-align: center;">
                                <a href="${sellerDashboardUrl}" class="action-button">View order</a>
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

    return { hasError: false, message: "Email sent successfully to seller." };
  } catch (error) {
    console.error("Error sending email to seller:", error);
    return { hasError: true, message: "Failed to send email to seller." };
  }
}

async function generateOrderNumber(sequenceNumber) {
  const prefix = "ORD";

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

  // Format the sequence number with leading zeros
  const formattedSequence = String(sequenceNumber).padStart(4, "0");

  return `${prefix}/${financialYear}/${formattedSequence}`;
}

async function generateInvoiceNumberForEdprowise(sequenceNumber) {
  const prefix = "EINV";

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Determine financial year (April to March)
  let financialYearStart, financialYearEnd;
  if (currentMonth >= 4) {
    financialYearStart = currentYear;
    financialYearEnd = currentYear + 1;
  } else {
    financialYearStart = currentYear - 1;
    financialYearEnd = currentYear;
  }

  const financialYear = `${financialYearStart}-${financialYearEnd
    .toString()
    .slice(-2)}`;

  // Format the sequence number with leading zeros
  const formattedSequence = String(sequenceNumber).padStart(4, "0");

  return `${prefix}/${financialYear}/${formattedSequence}`;
}

async function generateInvoiceNumberForSchool(sequenceNumber) {
  const prefix = "SINV";

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Determine financial year (April to March)
  let financialYearStart, financialYearEnd;
  if (currentMonth >= 4) {
    financialYearStart = currentYear;
    financialYearEnd = currentYear + 1;
  } else {
    financialYearStart = currentYear - 1;
    financialYearEnd = currentYear;
  }

  const financialYear = `${financialYearStart}-${financialYearEnd
    .toString()
    .slice(-2)}`;

  const formattedSequence = String(sequenceNumber).padStart(4, "0");

  return `${prefix}/${financialYear}/${formattedSequence}`;
}

async function getNextOrderSequence(financialYear) {
  // Find all orders for this financial year
  const orders = await OrderDetailsFromSeller.find({
    orderNumber: new RegExp(`^ORD/${financialYear}/`),
  }).sort({ createdAt: -1 });

  if (orders.length === 0) {
    return 1;
  }

  // Get the highest sequence number
  const maxSequence = Math.max(
    ...orders.map((order) => {
      const parts = order.orderNumber.split("/");
      return parseInt(parts[2]);
    })
  );

  return maxSequence + 1;
}

async function getNextInvoiceSequence(financialYear, type) {
  const prefix = type === "edprowise" ? "EINV" : "SINV";

  const invoices = await OrderDetailsFromSeller.find({
    [type === "edprowise" ? "invoiceForEdprowise" : "invoiceForSchool"]:
      new RegExp(`^${prefix}/${financialYear}/`),
  }).sort({ createdAt: -1 });

  if (invoices.length === 0) {
    return 1;
  }

  const maxSequence = Math.max(
    ...invoices.map((invoice) => {
      const invoiceNumber =
        type === "edprowise"
          ? invoice.invoiceForEdprowise
          : invoice.invoiceForSchool;
      const parts = invoiceNumber.split("/");
      return parseInt(parts[2]);
    })
  );

  return maxSequence + 1;
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
          "Access denied: You do not have permission to request a quote.",
      });
    }

    let {
      enquiryNumber,
      products,
      deliveryAddress,
      deliveryCountry,
      deliveryState,
      deliveryCity,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
    } = req.body;

    if (!enquiryNumber) {
      return res
        .status(400)
        .json({ hasError: true, message: "Enquiry number is required." });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ hasError: true, message: "At least one product is required." });
    }

    const selectedCartIds = products.map((p) => p.cartId);

    if (selectedCartIds.includes(undefined) || selectedCartIds.includes(null)) {
      return res.status(400).json({
        hasError: true,
        message: "Each product must have a valid cartId.",
      });
    }

    const carts = await Cart.find({
      _id: { $in: selectedCartIds },
      enquiryNumber,
    });
    if (carts.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: "No carts found for the given enquiry number.",
      });
    }

    const cartMap = new Map(carts.map((cart) => [cart._id.toString(), cart]));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    let financialYearStart, financialYearEnd;
    if (currentMonth >= 4) {
      financialYearStart = currentYear;
      financialYearEnd = currentYear + 1;
    } else {
      financialYearStart = currentYear - 1;
      financialYearEnd = currentYear;
    }
    const financialYear = `${financialYearStart}-${financialYearEnd
      .toString()
      .slice(-2)}`;

    const orderSequence = await getNextOrderSequence(financialYear);
    const edprowiseSequence = await getNextInvoiceSequence(
      financialYear,
      "edprowise"
    );
    const schoolSequence = await getNextInvoiceSequence(
      financialYear,
      "school"
    );

    const sellerIds = Array.from(
      new Set(
        products
          .map((p) => cartMap.get(p.cartId)?.sellerId?.toString())
          .filter(Boolean)
      )
    );

    const sellerOrderNumbers = new Map();
    const sellerInvoiceNumbers = new Map();

    let currentOrderSequence = orderSequence;
    let currentEdprowiseSequence = edprowiseSequence;
    let currentSchoolSequence = schoolSequence;

    for (const sellerId of sellerIds) {
      const orderNumber = await generateOrderNumber(currentOrderSequence++);
      sellerOrderNumbers.set(sellerId.toString(), orderNumber);

      const invoiceForEdprowise = await generateInvoiceNumberForEdprowise(
        currentEdprowiseSequence++
      );
      const invoiceForSchool = await generateInvoiceNumberForSchool(
        currentSchoolSequence++
      );

      sellerInvoiceNumbers.set(sellerId.toString(), {
        invoiceForEdprowise,
        invoiceForSchool,
      });
    }

    const orderFromBuyerEntries = [];
    const orderDetailsFromSellerEntries = new Map();

    for (const product of products) {
      const cartEntry = cartMap.get(product.cartId);
      if (!cartEntry) {
        return res.status(400).json({
          hasError: true,
          message: `Cart with ID ${product.cartId} not found.`,
        });
      }

      if (!cartEntry.sellerId) {
        return res.status(400).json({
          hasError: true,
          message: `Cart with ID ${product.cartId} is missing a sellerId.`,
        });
      }

      const sellerIdStr = cartEntry.sellerId.toString();
      const orderNumber = sellerOrderNumbers.get(sellerIdStr);
      const { invoiceForEdprowise, invoiceForSchool } =
        sellerInvoiceNumbers.get(sellerIdStr);

      orderFromBuyerEntries.push({
        orderNumber,
        schoolId,
        enquiryNumber,
        cartId: product.cartId,
        sellerId: cartEntry.sellerId,
        cartImages: cartEntry.cartImages || [],
        subcategoryName: cartEntry.subcategoryName || "",
        subCategoryId: cartEntry.subCategoryId || "",
        hsnSacc: cartEntry.hsnSacc || "",
        listingRate: cartEntry.listingRate || 0,
        edprowiseMargin: cartEntry.edprowiseMargin || 0,
        quantity: cartEntry.quantity || 0,
        finalRateBeforeDiscount: cartEntry.finalRateBeforeDiscount || 0,
        discount: cartEntry.discount || 0,
        finalRate: cartEntry.finalRate || 0,
        taxableValue: cartEntry.taxableValue || 0,
        cgstRate: cartEntry.cgstRate || 0,
        cgstAmount: cartEntry.cgstAmount || 0,
        sgstRate: cartEntry.sgstRate || 0,
        sgstAmount: cartEntry.sgstAmount || 0,
        igstRate: cartEntry.igstRate || 0,
        igstAmount: cartEntry.igstAmount || 0,
        amountBeforeGstAndDiscount: cartEntry.amountBeforeGstAndDiscount || 0,
        discountAmount: cartEntry.discountAmount || 0,
        gstAmount: cartEntry.gstAmount || 0,
        totalAmount: cartEntry.totalAmount || 0,
      });

      const quoteProposal = await QuoteProposal.findOne({
        sellerId: cartEntry.sellerId,
        enquiryNumber: enquiryNumber,
      }).session(session);

      const quoteNumber = quoteProposal ? quoteProposal.quoteNumber : null;

      if (!orderDetailsFromSellerEntries.has(cartEntry.sellerId.toString())) {
        orderDetailsFromSellerEntries.set(cartEntry.sellerId.toString(), {
          orderNumber,
          sellerId: cartEntry.sellerId,
          schoolId,
          enquiryNumber,
          invoiceForSchool,
          invoiceForEdprowise,
          quoteNumber,
        });
      }
    }

    if (orderFromBuyerEntries.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "No valid products to add to Order.",
      });
    }

    const savedEntries = await OrderFromBuyer.insertMany(
      orderFromBuyerEntries,
      { session }
    );

    const orderDetailsList = Array.from(orderDetailsFromSellerEntries.values());
    const savedOrderDetails = await OrderDetailsFromSeller.insertMany(
      orderDetailsList,
      { session }
    );

    await QuoteRequest.findOneAndUpdate(
      { schoolId, enquiryNumber },
      [
        {
          $set: {
            deliveryAddress: { $ifNull: [deliveryAddress, "$deliveryAddress"] },
            deliveryCountry: {
              $ifNull: [deliveryCountry, "$deliveryCountry"],
            },
            deliveryState: {
              $ifNull: [deliveryState, "$deliveryState"],
            },
            deliveryCity: {
              $ifNull: [deliveryCity, "$deliveryCity"],
            },
            deliveryLandMark: {
              $ifNull: [deliveryLandMark, "$deliveryLandMark"],
            },
            deliveryPincode: { $ifNull: [deliveryPincode, "$deliveryPincode"] },
            expectedDeliveryDate: {
              $ifNull: [expectedDeliveryDate, "$expectedDeliveryDate"],
            },
          },
        },
      ],
      { session, upsert: true, new: true }
    );

    for (const entry of orderFromBuyerEntries) {
      await QuoteProposal.findOneAndUpdate(
        { sellerId: entry.sellerId, enquiryNumber: enquiryNumber },
        {
          supplierStatus: "Order Received",
          edprowiseStatus: "Order Placed",
          buyerStatus: "Order Placed",
        },
        { new: true }
      );

      await SubmitQuote.findOneAndUpdate(
        { sellerId: entry.sellerId, enquiryNumber: enquiryNumber },
        {
          venderStatusFromBuyer: "Order Placed",
        },
        { new: true }
      );
    }

    for (const sellerId of sellerIds) {
      await Cart.deleteMany({
        _id: { $in: selectedCartIds },
        enquiryNumber: enquiryNumber,
        schoolId: schoolId,
      }).session(session);
    }

    const schoolDetail = await School.findOne({ schoolId });
    const schoolEmail = schoolDetail.schoolEmail;
    const schoolName = schoolDetail.schoolName;

    await sendSchoolRequestQuoteEmail(schoolName, schoolEmail, {
      orders: await Promise.all(
        Array.from(sellerOrderNumbers.entries()).map(
          async ([sellerId, orderNumber]) => ({
            orderNumber,
            seller: await SellerProfile.findById(sellerId),
            products: orderFromBuyerEntries.filter(
              (o) => o.sellerId.toString() === sellerId
            ),
          })
        )
      ),
    });

    for (const [sellerId, orderNumber] of sellerOrderNumbers.entries()) {
      const sellerDetails = await SellerProfile.findById(sellerId);

      if (!sellerDetails) {
        console.error(`Seller profile not found for ID: ${sellerId}`);
        continue;
      }
      const sellerProducts = orderFromBuyerEntries.filter(
        (o) => o.sellerId.toString() === sellerId
      );

      await sendEmailsToSellers(
        sellerDetails.companyName,
        sellerDetails.emailId,
        schoolName,
        {
          orderNumber,
          products: sellerProducts,
          deliveryAddress,
          deliveryCountry,
          deliveryState,
          deliveryCity,
          deliveryLandMark,
          deliveryPincode,
          expectedDeliveryDate,
        }
      );
    }

    const schoolProfile = await School.findOne({ schoolId });

    for (const savedEntry of savedOrderDetails) {
      const sellerId = savedEntry.sellerId.toString();
      const orderNumber = savedEntry.orderNumber;

      await NotificationService.sendNotification(
        "SELLER_RECEIVED_ORDER",
        [{ id: sellerId, type: "seller" }],
        {
          schoolName: schoolProfile?.schoolName || "Unknown School",
          enquiryNumber: enquiryNumber,
          orderNumber: orderNumber,
          entityId: savedEntry._id,
          entityType: "Order From Buyer",
          senderType: "school",
          senderId: schoolId,
          metadata: {
            enquiryNumber,
            orderNumber,
            type: "seller_received_order",
          },
        }
      );
    }

    for (const savedEntry of savedOrderDetails) {
      const orderNumber = savedEntry.orderNumber;
      const sellerProfile = await SellerProfile.findOne({
        sellerId: savedEntry.sellerId,
      }).session(session);

      await NotificationService.sendNotification(
        "SCHOOL_PLACED_ORDER",
        [{ id: schoolId, type: "school" }],
        {
          schoolName: schoolProfile?.schoolName || "Unknown School",
          companyName: sellerProfile?.companyName || "Unknown Company",
          enquiryNumber: enquiryNumber,
          orderNumber: orderNumber,
          entityId: savedEntry._id,
          entityType: "Order From Buyer",
          senderType: "school",
          senderId: schoolId,
          metadata: {
            enquiryNumber,
            orderNumber,
            type: "school_placed_order",
          },
        }
      );
    }

    const relevantAdmins = await AdminUser.find({}).session(session);
    for (const savedEntry of savedOrderDetails) {
      const sellerProfile = await SellerProfile.findOne({
        sellerId: savedEntry.sellerId,
      }).session(session);

      for (const admin of relevantAdmins) {
        await NotificationService.sendNotification(
          "EDPROWISE_RECEIVED_ORDER",
          [{ id: admin._id.toString(), type: "edprowise" }],
          {
            schoolName: schoolProfile?.schoolName || "Unknown School",
            companyName: sellerProfile?.companyName || "Unknown Company",
            enquiryNumber: enquiryNumber,
            orderNumber: savedEntry.orderNumber,
            entityId: savedEntry._id,
            entityType: "Order From Buyer",
            senderType: "school",
            senderId: schoolId,
            metadata: {
              enquiryNumber,
              orderNumber: savedEntry.orderNumber,
              type: "edprowise_received_order",
            },
          }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: "Selected products added to Order successfully.",
      data: savedEntries,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating OrderFromBuyer:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: "Duplicate entry: These products are already in the Order.",
      });
    }

    return res
      .status(500)
      .json({ hasError: true, message: "Internal server error." });
  }
}

export default create;
