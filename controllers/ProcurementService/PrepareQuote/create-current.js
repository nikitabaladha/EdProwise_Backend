import PrepareQuote from "../../../models/ProcurementService/PrepareQuote.js";
import PrepareQuoteValidator from "../../../validators/ProcurementService/PrepareQuote.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import SellerProfile from "../../../models/SellerProfile.js";
import EdprowiseProfile from "../../../models/EdprowiseProfile.js";
import AdminUser from "../../../models/AdminUser.js";
import mongoose from "mongoose";
import { NotificationService } from "../../notificationService.js";

// Generate Quote Number
async function generateQuoteNumber(session) {
  const prefix = "QUOTE";
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

  // IMPORTANT: use the session in findOne
  const lastQuote = await QuoteProposal.findOne({
    quoteNumber: new RegExp(`^QUOTE/${financialYear}/`),
  })
    .sort({ createdAt: -1 })
    .session(session); // <- here

  let sequenceNumber = lastQuote
    ? parseInt(lastQuote.quoteNumber.split("/")[2]) + 1
    : 1;
  const formattedSequence = String(sequenceNumber).padStart(4, "0");

  return `${prefix}/${financialYear}/${formattedSequence}`;
}

// Create function
async function create(req, res) {
  let quoteNumber;
  let session;

  try {
    session = await mongoose.startSession();

    session.startTransaction();

    const sellerId = req.user?.id;
    if (!sellerId) throw new Error("Unauthorized");

    let { enquiryNumber, products } = req.body;
    if (!enquiryNumber) throw new Error("Enquiry number is required.");
    if (typeof products === "string") products = JSON.parse(products);
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("At least one product must be provided.");
    }

    const [quoteRequest, sellerProfile, edprowiseProfile] = await Promise.all([
      QuoteRequest.findOne({ enquiryNumber }).session(session),
      SellerProfile.findOne({ sellerId }).session(session),
      EdprowiseProfile.findOne().session(session),
    ]);

    if (!quoteRequest || !sellerProfile || !edprowiseProfile) {
      throw new Error("Required profile data not found.");
    }

    const schoolState = quoteRequest.deliveryState;
    const sellerState = sellerProfile.state;
    const edprowiseState = edprowiseProfile.state;

    if (!schoolState || !sellerState || !edprowiseState) {
      throw new Error("Location data is incomplete.");
    }

    const uploadedImages = req.files || [];
    const createdEntries = [];

    let totalQuantity = 0,
      totalFinalRateBeforeDiscount = 0,
      totalTaxableValue = 0,
      totalCgstAmount = 0,
      totalSgstAmount = 0,
      totalIgstAmount = 0,
      totalTaxAmount = 0,
      totalAmountBeforeGstAndDiscount = 0,
      totalDiscountAmount = 0,
      totalAmount = 0,
      totalFinalRate = 0,
      totalFinalRateBeforeDiscountForEdprowise = 0,
      totalTaxableValueForEdprowise = 0,
      totalCgstAmountForEdprowise = 0,
      totalSgstAmountForEdprowise = 0,
      totalIgstAmountForEdprowise = 0,
      totalTaxAmountForEdprowise = 0,
      totalAmountForEdprowise = 0,
      totalFinalRateForEdprowise = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      const { error } = PrepareQuoteValidator.prepareQuoteCreate.validate({
        sellerId,
        enquiryNumber,
        ...product,
      });
      if (error?.details?.length) {
        throw new Error(error.details.map((err) => err.message).join(", "));
      }

      const requiredFields = [
        "listingRate",
        "edprowiseMargin",
        "quantity",
        "discount",
      ];
      for (const field of requiredFields) {
        if (product[field] === undefined || product[field] === null) {
          throw new Error(`Field '${field}' is required for calculations.`);
        }
      }

      const prepareQuoteImages = [];
      const imageKeys = Object.keys(req.files || {}).filter((key) =>
        new RegExp(`^products\\[${i}\\]\\[prepareQuoteImages\\]\\[\\d\\]`).test(
          key
        )
      );

      imageKeys.forEach((key) => {
        req.files[key].forEach((file) => {
          prepareQuoteImages.push(`/Images/PrepareQuoteImage/${file.filename}`);
        });
      });

      const listingRate = parseFloat(product.listingRate);
      const edprowiseMargin = parseFloat(product.edprowiseMargin);
      const quantity = parseFloat(product.quantity);
      const discount = parseFloat(product.discount);
      const cgstRate = parseFloat(product.cgstRate) || 0;
      const sgstRate = parseFloat(product.sgstRate) || 0;
      const igstRate = parseFloat(product.igstRate) || 0;

      let cgstRateForEdprowise = 0,
        sgstRateForEdprowise = 0,
        igstRateForEdprowise = 0;

      if (schoolState === edprowiseState && edprowiseState === sellerState) {
        cgstRateForEdprowise = cgstRate;
        sgstRateForEdprowise = sgstRate;
        igstRateForEdprowise = igstRate;
      } else if (
        schoolState !== edprowiseState &&
        edprowiseState === sellerState
      ) {
        cgstRateForEdprowise = igstRate / 2;
        sgstRateForEdprowise = igstRate / 2;
      } else if (
        schoolState !== edprowiseState &&
        edprowiseState !== sellerState
      ) {
        igstRateForEdprowise = igstRate;
      } else if (
        schoolState === edprowiseState &&
        edprowiseState !== sellerState
      ) {
        igstRateForEdprowise = cgstRate + sgstRate;
      }

      const finalRateBeforeDiscount =
        listingRate + (listingRate * edprowiseMargin) / 100;
      const finalRate =
        finalRateBeforeDiscount - (finalRateBeforeDiscount * discount) / 100;
      const finalRateForEdprowise = (finalRate / (edprowiseMargin + 100)) * 100;

      const taxableValue = finalRate * quantity;
      const taxableValueForEdprowise = finalRateForEdprowise * quantity;

      const cgstAmount = (taxableValue * cgstRate) / 100;
      const sgstAmount = (taxableValue * sgstRate) / 100;
      const igstAmount = (taxableValue * igstRate) / 100;

      const cgstAmountForEdprowise =
        (taxableValueForEdprowise * cgstRateForEdprowise) / 100;
      const sgstAmountForEdprowise =
        (taxableValueForEdprowise * sgstRateForEdprowise) / 100;
      const igstAmountForEdprowise =
        (taxableValueForEdprowise * igstRateForEdprowise) / 100;

      const amountBeforeGstAndDiscount = finalRateBeforeDiscount * quantity;
      const discountAmount = (amountBeforeGstAndDiscount * discount) / 100;
      const gstAmount = cgstAmount + sgstAmount + igstAmount;
      const gstAmountForEdprowise =
        cgstAmountForEdprowise +
        sgstAmountForEdprowise +
        igstAmountForEdprowise;

      const totalAmountForProduct =
        amountBeforeGstAndDiscount - discountAmount + gstAmount;
      const totalAmountForProductForEdprowise =
        taxableValueForEdprowise + gstAmountForEdprowise;

      // Accumulate totals
      totalQuantity += quantity;
      totalAmount += totalAmountForProduct;
      totalFinalRateBeforeDiscount += finalRateBeforeDiscount;
      totalDiscountAmount += discountAmount;
      totalTaxableValue += taxableValue;
      totalCgstAmount += cgstAmount;
      totalSgstAmount += sgstAmount;
      totalIgstAmount += igstAmount;
      totalTaxAmount += gstAmount;
      totalAmountBeforeGstAndDiscount += amountBeforeGstAndDiscount;
      totalFinalRate += finalRate;

      totalFinalRateBeforeDiscountForEdprowise += finalRateBeforeDiscount;
      totalTaxableValueForEdprowise += taxableValueForEdprowise;
      totalCgstAmountForEdprowise += cgstAmountForEdprowise;
      totalSgstAmountForEdprowise += sgstAmountForEdprowise;
      totalIgstAmountForEdprowise += igstAmountForEdprowise;
      totalTaxAmountForEdprowise += gstAmountForEdprowise;
      totalAmountForEdprowise += totalAmountForProductForEdprowise;
      totalFinalRateForEdprowise += finalRateForEdprowise;

      const newPrepareQuote = new PrepareQuote({
        sellerId,
        enquiryNumber,
        prepareQuoteImages,
        ...product,
        listingRate,
        edprowiseMargin,
        quantity,
        finalRateBeforeDiscount,
        discount,
        finalRate,
        taxableValue,
        cgstRate,
        sgstRate,
        igstRate,
        cgstRateForEdprowise,
        sgstRateForEdprowise,
        igstRateForEdprowise,
        cgstAmount,
        sgstAmount,
        igstAmount,
        amountBeforeGstAndDiscount,
        discountAmount,
        gstAmount,
        totalAmount: totalAmountForProduct,
        finalRateForEdprowise,
        taxableValueForEdprowise,
        cgstAmountForEdprowise,
        sgstAmountForEdprowise,
        igstAmountForEdprowise,
        gstAmountForEdprowise,
        totalAmountForEdprowise: totalAmountForProductForEdprowise,
      });

      const savedEntry = await newPrepareQuote.save({ session });
      createdEntries.push(savedEntry);
    }

    quoteNumber = await generateQuoteNumber(session);

    const newQuoteProposal = new QuoteProposal({
      quoteNumber,
      sellerId,
      enquiryNumber,
      totalQuantity,
      totalFinalRateBeforeDiscount,
      totalAmountBeforeGstAndDiscount,
      totalDiscountAmount,
      totalAmount,
      totalTaxableValue,
      totalCgstAmount,
      totalSgstAmount,
      totalIgstAmount,
      totalTaxAmount,
      totalFinalRate,
      totalFinalRateBeforeDiscountForEdprowise,
      totalTaxableValueForEdprowise,
      totalCgstAmountForEdprowise,
      totalSgstAmountForEdprowise,
      totalIgstAmountForEdprowise,
      totalTaxAmountForEdprowise,
      totalAmountForEdprowise,
      totalFinalRateForEdprowise,
      supplierStatus: "Quote Submitted",
      edprowiseStatus: "Quote Received",
      buyerStatus: "Quote Requested",
      orderStatus: "Pending",
    });

    await newQuoteProposal.save({ session });

    await QuoteRequest.findOneAndUpdate(
      { enquiryNumber },
      { edprowiseStatus: "Quote Received" },
      { new: true, session }
    );

    const newSubmitQuote = new SubmitQuote({
      sellerId,
      enquiryNumber,
      quoteNumber,
      quotedAmount: totalAmount,
      advanceRequiredAmount: 0,
    });

    await newSubmitQuote.save({ session });

    await session.commitTransaction();

    session.endSession();

    // Send notification after transaction committed
    await NotificationService.sendNotification(
      "SELLER_QUOTE_PREPARED",
      [{ id: sellerId, type: "seller" }],
      {
        enquiryNumber: enquiryNumber,
        quoteNumber: newQuoteProposal.quoteNumber,
        entityId: newQuoteProposal._id,
        entityType: "QuoteProposal",
        senderType: "seller",
        senderId: sellerId,
        metadata: {
          enquiryNumber,
          type: "quote_prepared",
        },
      }
    );

    const relevantEdprowise = await AdminUser.find({});

    await NotificationService.sendNotification(
      "EDPROWISE_QUOTE_RECEIVED_FROM_SELLER",
      relevantEdprowise.map((admin) => ({
        id: admin._id.toString(),
        type: "edprowise",
      })),
      {
        companyName: sellerProfile.companyName,
        enquiryNumber: enquiryNumber,
        quoteNumber: newQuoteProposal.quoteNumber,
        entityId: newQuoteProposal._id,
        entityType: "QuoteProposal From Seller",
        senderType: "seller",
        senderId: sellerId,
        metadata: {
          enquiryNumber,
          type: "quote_received_from_seller",
        },
      }
    );

    return res.status(201).json({
      hasError: false,
      message: "Quotes and Quote Proposal created successfully.",
      data: {
        prepareQuotes: createdEntries,
        quoteProposal: newQuoteProposal,
        submitQuote: newSubmitQuote,
      },
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Error creating Prepare quotes or Quote Proposal:", error);
    return res.status(500).json({
      hasError: true,
      message: error.message || "Internal server error.",
    });
  }
}

export default create;
