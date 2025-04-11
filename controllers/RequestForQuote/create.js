import Product from "../../models/Product.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import ProductValidator from "../../validators/Product.js";
import mongoose from "mongoose";

import School from "../../models/School.js";
import Category from "../../models/Category.js";
import SubCategory from "../../models/SubCategory.js";
import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import SchoolRequestForQuoteEmailTemplate from "../../models/EmailTeamplates/SchoolRequestForQuoteEmailTemplate.js";

function generateEnquiryNumber() {
  const prefix = "ENQ";
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${randomSuffix}`;
}

async function sendSchoolRequestQuoteEmail(schoolName, schoolEmail, usersWithCredentials) {
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
    const emailTemplate = await SchoolRequestForQuoteEmailTemplate.findOne();
    if (!emailTemplate) {
      console.error("Email template not found");
      return false;
    }

    // 3. Nodemailer setup
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


    const { enquiryNumber, products, quoteRequest } = usersWithCredentials;


    
    const quoteDetailsHtml = `
      <h3>Enquiry No: ${enquiryNumber}</h3>

      <h3>Quote Request Details</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Category</th>
            <th>Sub Category</th>
            <th>Description</th>
            <th>Unit</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${products.map((product, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${product.categoryName}</td>
              <td>${product.subCategoryName}</td>
              <td>${product.description || '-'}</td>
              <td>${product.unit}</td>
              <td>${product.quantity}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    // 6. Create deliveryDetailsHtml
    const deliveryDetailsHtml = `
      <h3>Delivery Information</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr><th>Address</th><td>${quoteRequest.deliveryAddress || '-'}</td></tr>
        <tr><th>Location</th><td>${quoteRequest.deliveryLocation || '-'}</td></tr>
        <tr><th>Landmark</th><td>${quoteRequest.deliveryLandMark || '-'}</td></tr>
        <tr><th>Pincode</th><td>${quoteRequest.deliveryPincode || '-'}</td></tr>
        <tr><th>Expected Delivery Date</th><td>${quoteRequest.expectedDeliveryDate || '-'}</td></tr>
        
      </table>
    `;

    // 7. Build final email body
    const emailContent = emailTemplate.content
      .replace(/{schoolName}/g, schoolName)
      .replace(/{mailForm}/g, smtpSettings.mailFromName)
      .replace(/{quoteDetails}/g, quoteDetailsHtml)
      .replace(/{deliveryDetails}/g, deliveryDetailsHtml)
      .replace(/{app_url}/g, smtpSettings.mailHost);

    // 8. Send email
    await transporter.sendMail({
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: schoolEmail,
      subject: emailTemplate.subject,
      html: emailContent,
    });

    console.log("Request quote email sent successfully");
    return { hasError: false, message: "Email sent successfully." };

  } catch (error) {
    console.error("Error sending quote request email:", error);
    return { hasError: true, message: "Email is not proper, we cannot send the email." };
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
    const enquiryNumber = generateEnquiryNumber();

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

      const productImageKey = `products[${i}][productImage]`;
      const productImage = req.files[productImageKey]
        ? `/Images/ProductImage/${req.files[productImageKey][0].filename}`
        : null;

      const newProduct = new Product({
        schoolId,
        productImage,
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
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
    } = JSON.parse(req.body.data);

    const newQuoteRequest = new QuoteRequest({
      schoolId,
      enquiryNumber,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
      buyerStatus: "Quote Requested",
      supplierStatus: "Quote Requested",
      edprowiseStatus: "Quote Requested",
    });

    await newQuoteRequest.save({ session });
    
    // add umesh
    const schoolDetail = await School.findOne({schoolId})
    console.log("School details: ",schoolDetail);
    
    const schoolEmail = schoolDetail.schoolEmail;
    const schoolName = schoolDetail.schoolName;
    console.log("school Name:", schoolName);
    
    const enrichedProducts = await Promise.all(
      createdEntries.map(async (product) => {
        const category = await Category.findById(product.categoryId).lean();
        const subCategory = await SubCategory.findById(product.subCategoryId).lean();

        return {
          ...product.toObject(),
          categoryName: category?.categoryName || "Unknown Category",
          subCategoryName: subCategory?.subCategoryName || "Unknown SubCategory",
        };
      })
    );

    await session.commitTransaction();
    session.endSession();
    
    await sendSchoolRequestQuoteEmail(schoolName, schoolEmail, {
      enquiryNumber,
      products: enrichedProducts,
      quoteRequest: newQuoteRequest,
    });
    return res.status(201).json({
      hasError: false,
      message: "Quotes and Quote Proposal created successfully.",
      data: {
        products: createdEntries,
        quoteRequest: newQuoteRequest,
      },
    });
  } catch (error) {
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
