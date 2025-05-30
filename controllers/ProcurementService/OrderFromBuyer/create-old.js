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

async function generateOrderNumber() {
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

function generateInvoiceNumberForEdprowise() {
  const prefix = "EINV";
  const randomSuffix = Math.floor(Math.random() * 100000000);
  const formattedSuffix = String(randomSuffix).padStart(8, "0");
  return `${prefix}${formattedSuffix}`;
}

function generateInvoiceNumberForSchool() {
  const prefix = "SINV";
  const randomSuffix = Math.floor(Math.random() * 100000000);
  const formattedSuffix = String(randomSuffix).padStart(8, "0");
  return `${prefix}${formattedSuffix}`;
}

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
    )}/school-dashboard/procurement-services/track-order-history`;
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
      subject: `Order Place Successfully For #${enquiryNumber}`,
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
                            <p class="message">Dear ${schoolName},</p>
                            

                            <p class="message">This Email confirm that your order, has been placed and is being processed.</p>
                            
                            <h3 class="heading">Enquiry Number : ${enquiryNumber}</h3>
                            <h3 class="heading">Order Number : ${orderNumber}</h3>

                            <!-- Quote Details Box -->
                            ${quoteDetailsHtml}

                
                            <!-- Action Button -->
                            <p class="message">Please click below button for view quote proposal </p>
                            <div style="text-align: center;">
                                <a href="${viewQuoteUrl}" class="action-button">View Quote</a>
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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const sellerDashboardUrl = `${frontendUrl.replace(
      /\/+$/,
      ""
    )}/seller-dashboard/procurement-services/track-order-history`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    const {
      orderNumber,
      products,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
    } = orderDetails;

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
      subject: `Order Received for Enquiry #${enquiryNumber}`,
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
                            <p class="message">Dear ${sellerName},</p>
                            

                            <p class="message">We are pleased to inform you that ${schoolName} has responded to your quote proposal with order. Below are the key details of their order</p>
                            
                            <h3 class="heading">Enquiry Number : ${enquiryNumber}</h3>
                            <h3 class="heading">Order Number : ${orderNumber}</h3>

                            <!-- Quote Details Box -->
                            ${orderDetailsTable}

                            <!-- Action Button -->
                            <p class="message">Please click below button for view order details </p>
                            <div style="text-align: center;">
                                <a href="${sellerDashboardUrl}" class="action-button">View order</a>
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

    return { hasError: false, message: "Email sent successfully to seller." };
  } catch (error) {
    console.error("Error sending email to seller:", error);
    return { hasError: true, message: "Failed to send email to seller." };
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
    const existingOrders = await OrderFromBuyer.find({
      cartId: { $in: selectedCartIds },
    }).select("cartId");
    const existingCartIds = new Set(
      existingOrders.map((order) => order.cartId.toString())
    );

    const sellerOrderNumbers = new Map();
    const orderNumber = generateOrderNumber();

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

      if (existingCartIds.has(product.cartId)) {
        return res.status(400).json({
          hasError: true,
          message: `These Product already present in Order table`,
        });
      }

      // Get or generate order number for this seller
      if (!sellerOrderNumbers.has(cartEntry.sellerId.toString())) {
        sellerOrderNumbers.set(
          cartEntry.sellerId.toString(),
          generateOrderNumber()
        );
      }

      const orderNumber = sellerOrderNumbers.get(cartEntry.sellerId.toString());

      orderFromBuyerEntries.push({
        orderNumber,
        schoolId,
        enquiryNumber,
        cartId: product.cartId,
        sellerId: cartEntry.sellerId,
        cartImage: cartEntry.cartImage || null,
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

      const invoiceForSchool = generateInvoiceNumberForSchool();
      const invoiceForEdprowise = generateInvoiceNumberForEdprowise();

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

    // Insert OrderFromBuyer entries
    const savedEntries = await OrderFromBuyer.insertMany(
      orderFromBuyerEntries,
      { session }
    );

    // Insert OrderDetailsFromSeller entries
    const orderDetailsList = Array.from(orderDetailsFromSellerEntries.values());
    await OrderDetailsFromSeller.insertMany(orderDetailsList, { session });

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

    const sellerIds = Array.from(
      new Set(orderFromBuyerEntries.map((entry) => entry.sellerId))
    );

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

    const sellerId = orderFromBuyerEntries[0].sellerId;

    console.log("seller id:", sellerId);

    const sellerDetails = await SellerProfile.findOne({ sellerId });

    const sellerName = sellerDetails.companyName;

    const sellerEmail = sellerDetails.emailId;

    // Send email to school

    // orderFromBuyerEntries  at time of sending mail i want to send orderNumber which ever is stored in orderFromBuyerEntries.orderNumber
    await sendSchoolRequestQuoteEmail(schoolName, schoolEmail, {
      orderNumber,

      products: orderFromBuyerEntries,
    });

    // Send emails to sellers

    // for (const [sellerId, sellerInfo] of sellerEmailsToSend.entries()) {

    await sendEmailsToSellers(
      sellerName,

      sellerEmail,

      schoolName,

      {
        orderNumber,

        products: orderFromBuyerEntries,

        deliveryAddress,

        deliveryCountry,
        deliveryState,
        deliveryCity,

        deliveryLandMark,

        deliveryPincode,

        expectedDeliveryDate,
      }
    );

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
