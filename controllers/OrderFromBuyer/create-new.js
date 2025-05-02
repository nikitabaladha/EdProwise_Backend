import mongoose from "mongoose";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import Cart from "../../models/Cart.js";
import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";

import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import School from "../../models/School.js";
import SellerProfile from "../../models/SellerProfile.js";
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

    const mainOrderNumber = await generateOrderNumber();

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
        sellerOrderNumbers.set(cartEntry.sellerId.toString(), mainOrderNumber);
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

    await sendSchoolRequestQuoteEmail(schoolName, schoolEmail, {
      orderNumber,
      products: orderFromBuyerEntries,
    });

    // Send emails to sellers

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
