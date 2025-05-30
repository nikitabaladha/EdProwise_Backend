import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";

import School from "../../../models/School.js";
import SellerProfile from "../../../models/SellerProfile.js";
import PrepareQuote from "../../../models/ProcurementService/PrepareQuote.js";
import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../../models/SMTPEmailSetting.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

    // 2. Email template

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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const viewQuoteUrl = `${frontendUrl.replace(
      /\/+$/,
      ""
    )}/school-dashboard/procurement-services/track-quote`;
    const contactUrl = `${frontendUrl.replace(/\/+$/, "")}/contact-us`;

    // 4. Destructure required values
    const { enquiryNumber, products, sellerCompanyName, quoteDetails } =
      usersWithCredentials;

    // 5. Proposal details as HTML - Detailed quote information
    // const proposalDetailsHtml = `
    //   <h3 style="font-size: 17px;">Quote Request Details:</h3>
    //   <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;" class="table-show">
    //     <thead>
    //       <tr>
    //         <th>S.No</th>
    //         <th>Category</th>
    //         <th>Quantity</th>
    //         <th>Listing Rate</th>
    //         <th>Discount (%)</th>
    //         <th>Final Rate</th>
    //         <th>Total Amount</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       ${quoteDetails
    //         .map(
    //           (item, index) => `
    //         <tr>
    //           <td style="text-align: center;">${index + 1}</td>
    //           <td style="text-align: center;">${item.subcategoryName}</td>
    //           <td style="text-align: center;">${item.quantity}</td>
    //           <td style="text-align: center;">${
    //             item.finalRateBeforeDiscount
    //           }</td>
    //           <td style="text-align: center;">${item.discount}</td>
    //           <td style="text-align: center;">${item.finalRate}</td>
    //           <td style="text-align: center;">${item.totalAmount}</td>
    //         </tr>
    //       `
    //         )
    //         .join("")}
    //     </tbody>
    //   </table>
    //   <br/>
    //   <h3 style="font-size: 17px;">Additional Information from Seller</h3>
    //   <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
    //       ${products
    //         .map(
    //           (product, index) => `
    //         <tr>
    //           <th>Description</th>
    //           <td>${product.description || "-"}</td>
    //         </tr>
    //         <tr>
    //           <th>Quoted Amount</th>
    //           <td>${product.quotedAmount || "-"}</td>
    //         </tr>
    //         <tr>
    //           <th>Payment Terms</th>
    //           <td >${product.paymentTerms || "-"}</td>
    //         </tr>
    //         <tr>
    //           <th>Advance Required (Rs)</th>
    //           <td >${product.advanceRequiredAmount || "-"}</td>
    //         </tr>
    //         <tr>
    //           <th>Expected Delivery Date</th>
    //           <td>${product.expectedDeliveryDateBySeller || "-"}</td>
    //         </tr>
    //         <tr>
    //           <th>Remarks</th>
    //           <td>${product.remarksFromSupplier || "-"}</td>
    //         </tr>
    //       `
    //         )
    //         .join("")}
    //   </table>
    // `;

    const proposalDetailsHtml = `
      <h3 style="font-size: 17px;">Quote Request Details:</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;" class="table-show">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Listing Rate</th>
            <th>Discount (%)</th>
            <th>Final Rate</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${quoteDetails
            .map(
              (item, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: center;">${item.subcategoryName}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: center;">${
                item.finalRateBeforeDiscount
              }</td>
              <td style="text-align: center;">${item.discount}</td>
              <td style="text-align: center;">${item.finalRate}</td>
              <td style="text-align: center;">${item.totalAmount}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
    `;

    const proposalDetailsHtmlForMobile = `
      
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;" class="table-flex">
      
          ${quoteDetails
            .map(
              (item, index) => `
            <tr>
              <th>S.No</th>
              <td style="text-align: center;">${index + 1}</td>
            </tr>
            
            <tr>
            <th>Category</th>
            <td style="text-align: center;">${item.subcategoryName}</td>
            </tr>

            <tr>
            <th>Quantity</th>
            <td style="text-align: center;">${item.quantity}</td>
            </tr>

            <tr>
            <th>Listing Rate</th>
            <td style="text-align: center;">${item.finalRateBeforeDiscount}</td>
            </tr>

            <tr>
            <th>Discount (%)</th>
            <td style="text-align: center;">${item.discount}</td>
            </tr>

            <tr>
            <th>Final Rate</th>
            <td style="text-align: center;">${item.finalRate}</td>
            </tr>

            <tr>
            <th>Total Amount</th>
             <td style="text-align: center;">${item.totalAmount}</td>
            </tr>  
            <tr>
            </tr>   
          `
            )
            .join("")}
        
      </table>
      
    `;

    const proposalDetailsInfo = `
      <h3 style="font-size: 17px;">Additional Information from Seller</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          ${products
            .map(
              (product, index) => `
            <tr>
              <th>Description</th>
              <td>${product.description || "-"}</td>
            </tr>
            <tr>
              <th>Quoted Amount</th>
              <td>${product.quotedAmount || "-"}</td>
            </tr>
            <tr>
              <th>Payment Terms</th>
              <td >${product.paymentTerms || "-"}</td>
            </tr>
            <tr>
              <th>Advance Required (Rs)</th>
              <td >${product.advanceRequiredAmount || "-"}</td>
            </tr>
            <tr>
              <th>Expected Delivery Date</th>
              <td>${product.expectedDeliveryDateBySeller || "-"}</td>
            </tr>
            <tr>
              <th>Remarks</th>
              <td>${product.remarksFromSupplier || "-"}</td>
            </tr>
          `
            )
            .join("")}
      </table>
    `;

    // 7. Send the email

    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: `Quote Proposal Come For ${enquiryNumber} `,
      html: `
              <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style type="text/css">
                        /* Base Styles */

                        .table-show {
                        display : block;
                        }

                        
                      .table-flex {
                      display : none;
                    }

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

                            .table-show {
                             display : none;
                            }

                            .table-flex {
                             display : flex;
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
                            

                            <p class="message">We are pleased to inform you that a vendor has responded to your quote request with a proposal. Below are the key details of their submission</p>
                            
                            <h3 class="heading">Enquiry Number : ${enquiryNumber}</h3>

                            <!-- Quote Details Box -->
                            ${proposalDetailsHtml}
                            ${proposalDetailsHtmlForMobile}
                            ${proposalDetailsInfo}

                
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

    console.log("Quote proposal email sent to school successfully.");
    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending quote request email:", error);
    return {
      hasError: true,
      message: "Email is not proper, we cannot send the email.",
    };
  }
}

async function updateVenderStatus(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;
    const { venderStatus } = req.body;

    if (!enquiryNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    const allowedStatuses = ["Quote Accepted", "Quote Not Accepted"];

    if (!allowedStatuses.includes(venderStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid venderStatus. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const existingQuote = await SubmitQuote.findOne({
      enquiryNumber,
      sellerId,
    });

    if (!existingQuote) {
      return res.status(404).json({
        hasError: true,
        message: "Quote not found for the given enquiryNumber and sellerId.",
      });
    }

    const existingQuoteRequest = await QuoteRequest.findOne({
      enquiryNumber,
    });

    if (!existingQuoteRequest) {
      return res.status(404).json({
        hasError: true,
        message: "Quote not found for the given enquiryNumber.",
      });
    }

    existingQuote.venderStatus = venderStatus;
    await existingQuote.save();

    if (venderStatus === "Quote Accepted") {
      existingQuoteRequest.buyerStatus = "Quote Received";

      await existingQuoteRequest.save();

      const school = await School.findOne({
        schoolId: existingQuoteRequest.schoolId,
      });

      if (!school) {
        return res.status(404).json({
          hasError: true,
          message: "School not found for this quote request.",
        });
      }

      const schoolName = school.schoolName;
      const schoolId = school.schoolId;
      const schoolEmail = school.schoolEmail;

      const quoteDetails = await PrepareQuote.find({
        enquiryNumber,
        sellerId,
      });

      const sellerSubmittedQuotes = await SubmitQuote.find({
        enquiryNumber,
        sellerId,
      });

      const products = sellerSubmittedQuotes.map((item) => ({
        quotedAmount: item.quotedAmount,
        remarksFromSupplier: item.remarksFromSupplier,
        description: item.description,
        paymentTerms: item.paymentTerms,
        advanceRequiredAmount: item.advanceRequiredAmount,
        expectedDeliveryDateBySeller: new Date(
          item.expectedDeliveryDateBySeller
        )
          .toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, " ")
          .replace(",", ","),
      }));

      const sellerDetails = await SellerProfile.find({ sellerId });

      const sellerCompanyName = sellerDetails.companyName;

      await sendSchoolRequestQuoteEmail(schoolName, schoolEmail, schoolId, {
        enquiryNumber,
        products,
        sellerCompanyName,
        quoteDetails,
        sellerId,
      });
    }
    return res.status(200).json({
      hasError: false,
      message: "Quote status updated successfully.",
      data: existingQuote,
    });
  } catch (error) {
    console.error("Error updating quote status:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateVenderStatus;
