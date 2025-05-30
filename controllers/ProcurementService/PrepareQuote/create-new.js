import PrepareQuote from "../../../models/ProcurementService/PrepareQuote.js";
import PrepareQuoteValidator from "../../../validators/ProcurementService/PrepareQuote.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import SellerProfile from "../../../models/SellerProfile.js";
import EdprowiseProfile from "../../../models/EdprowiseProfile.js";
import AdminUser from "../../../models/AdminUser.js";

import mongoose from "mongoose";

async function generateQuoteNumber() {
  const prefix = "QUOTE";

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
  const lastQuote = await QuoteProposal.findOne({
    quoteNumber: new RegExp(`^${prefix}/${financialYear}/`),
  }).sort({ createdAt: -1 });

  let sequenceNumber;
  if (lastQuote) {
    // Extract the sequence number from the last enquiry
    const lastSequence = parseInt(lastQuote.quoteNumber.split("/")[2]);
    sequenceNumber = lastSequence + 1;
  } else {
    // First enquiry of this financial year
    sequenceNumber = 1;
  }

  // Format the sequence number with leading zeros
  const formattedSequence = String(sequenceNumber).padStart(4, "0");

  return `${prefix}/${financialYear}/${formattedSequence}`;
}

// async function create(req, res) {
//   const session = await mongoose.startSession();
//   let savedQuoteProposal;
//   let createdEntries = [];

//   let sellerId;
//   let quoteNumber;

//   let sellerProfile;
//   let quoteRequest;
//   let edprowiseProfile;

//   try {
//     // Start transaction properly using withTransaction()
//     await session.withTransaction(async () => {
//       sellerId = req.user?.id;

//       if (!sellerId) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(401).json({
//           hasError: true,
//           message:
//             "Access denied: You do not have permission to Prepare quote.",
//         });
//       }

//       // Validate inputs
//       let { enquiryNumber, products } = req.body;

//       if (!enquiryNumber) {
//         return res.status(400).json({
//           hasError: true,
//           message: "Enquiry number is required.",
//         });
//       }

//       if (typeof products === "string") products = JSON.parse(products);

//       if (!Array.isArray(products) || products.length === 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: "At least one product must be provided.",
//         });
//       }

//       // Fetch data with session
//       [quoteRequest, sellerProfile, edprowiseProfile] = await Promise.all([
//         QuoteRequest.findOne({ enquiryNumber }).session(session),
//         SellerProfile.findOne({ sellerId }).session(session),
//         EdprowiseProfile.findOne().session(session),
//       ]);

//       if (!quoteRequest || !sellerProfile || !edprowiseProfile) {
//         return res.status(404).json({
//           hasError: true,
//           message: "Required profile data not found.",
//         });
//       }
//       // [Keep all your existing product processing logic...]

//       // Extract states from location strings
//       const schoolState = quoteRequest.deliveryState;
//       const sellerState = sellerProfile.state;
//       const edprowiseState = edprowiseProfile.state;

//       if (!schoolState || !sellerState || !edprowiseState) {
//         return res.status(400).json({
//           hasError: true,
//           message: "Location data is incomplete.",
//         });
//       }

//       const uploadedImages = req.files || [];
//       createdEntries = [];

//       let totalQuantity = 0;
//       let totalFinalRateBeforeDiscount = 0;
//       let totalTaxableValue = 0;
//       let totalCgstAmount = 0;
//       let totalSgstAmount = 0;
//       let totalIgstAmount = 0;
//       let totalTaxAmount = 0;
//       let totalAmountBeforeGstAndDiscount = 0;
//       let totalDiscountAmount = 0;
//       let totalAmount = 0;
//       let totalFinalRate = 0;

//       let totalFinalRateBeforeDiscountForEdprowise = 0;
//       let totalTaxableValueForEdprowise = 0;
//       let totalCgstAmountForEdprowise = 0;
//       let totalSgstAmountForEdprowise = 0;
//       let totalIgstAmountForEdprowise = 0;
//       let totalTaxAmountForEdprowise = 0;
//       let totalAmountForEdprowise = 0;
//       let totalFinalRateForEdprowise = 0;

//       for (let i = 0; i < products.length; i++) {
//         const product = products[i];

//         const { error } = PrepareQuoteValidator.prepareQuoteCreate.validate({
//           sellerId,
//           enquiryNumber,
//           ...product,
//         });

//         if (error?.details?.length) {
//           const errorMessages = error.details
//             .map((err) => err.message)
//             .join(", ");
//           return res
//             .status(400)
//             .json({ hasError: true, message: errorMessages });
//         }

//         const requiredFields = [
//           "listingRate",
//           "edprowiseMargin",
//           "quantity",
//           "discount",
//         ];

//         for (const field of requiredFields) {
//           if (product[field] === undefined || product[field] === null) {
//             return res.status(400).json({
//               hasError: true,
//               message: `Field '${field}' is required for calculations.`,
//             });
//           }
//         }

//         const prepareQuoteImages = [];
//         if (req.files) {
//           const imageKeys = Object.keys(req.files).filter((key) => {
//             for (let j = 0; j <= 4; j++) {
//               if (key.startsWith(`products[${i}][prepareQuoteImages][${j}]`))
//                 return true;
//             }
//             return false;
//           });
//           imageKeys.forEach((key) => {
//             req.files[key].forEach((file) => {
//               prepareQuoteImages.push(
//                 `/Images/PrepareQuoteImage/${file.filename}`
//               );
//             });
//           });
//         }

//         // Perform calculations
//         const listingRate = parseFloat(product.listingRate);
//         const edprowiseMargin = parseFloat(product.edprowiseMargin);
//         const quantity = parseFloat(product.quantity);
//         const discount = parseFloat(product.discount);

//         // Original GST rates from product
//         const cgstRate = parseFloat(product.cgstRate) || 0;
//         const sgstRate = parseFloat(product.sgstRate) || 0;
//         const igstRate = parseFloat(product.igstRate) || 0;

//         // Determine GST rates for Edprowise based on location scenarios
//         let cgstRateForEdprowise = 0;
//         let sgstRateForEdprowise = 0;
//         let igstRateForEdprowise = 0;

//         // Scenario 1: All locations match
//         if (schoolState === edprowiseState && edprowiseState === sellerState) {
//           cgstRateForEdprowise = cgstRate;
//           sgstRateForEdprowise = sgstRate;
//           igstRateForEdprowise = igstRate;
//         }
//         // Scenario 2: School ≠ Edprowise = Seller
//         else if (
//           schoolState !== edprowiseState &&
//           edprowiseState === sellerState
//         ) {
//           cgstRateForEdprowise = igstRate / 2;
//           sgstRateForEdprowise = igstRate / 2;
//           igstRateForEdprowise = 0;
//         }
//         // Scenario 3: All locations different
//         else if (
//           schoolState !== edprowiseState &&
//           edprowiseState !== sellerState
//         ) {
//           cgstRateForEdprowise = 0;
//           sgstRateForEdprowise = 0;
//           igstRateForEdprowise = igstRate;
//         }
//         // Scenario 4: School = Edprowise ≠ Seller
//         else if (
//           schoolState === edprowiseState &&
//           edprowiseState !== sellerState
//         ) {
//           cgstRateForEdprowise = 0;
//           sgstRateForEdprowise = 0;
//           igstRateForEdprowise = cgstRate + sgstRate;
//         }

//         // Calculate finalRateBeforeDiscount
//         const finalRateBeforeDiscount =
//           listingRate + (listingRate * edprowiseMargin) / 100;

//         // Calculate finalRate
//         const finalRate =
//           finalRateBeforeDiscount - (finalRateBeforeDiscount * discount) / 100;

//         const finalRateForEdprowise =
//           (finalRate / (edprowiseMargin + 100)) * 100;

//         // Calculate taxableValue
//         const taxableValue = finalRate * quantity;
//         const taxableValueForEdprowise = finalRateForEdprowise * quantity;

//         // Calculate GST amounts using the determined rates
//         const cgstAmount = (taxableValue * cgstRate) / 100;
//         const sgstAmount = (taxableValue * sgstRate) / 100;
//         const igstAmount = (taxableValue * igstRate) / 100;

//         const cgstAmountForEdprowise =
//           (taxableValueForEdprowise * cgstRateForEdprowise) / 100;
//         const sgstAmountForEdprowise =
//           (taxableValueForEdprowise * sgstRateForEdprowise) / 100;
//         const igstAmountForEdprowise =
//           (taxableValueForEdprowise * igstRateForEdprowise) / 100;

//         // Calculate amountBeforeGstAndDiscount
//         const amountBeforeGstAndDiscount = finalRateBeforeDiscount * quantity;

//         // Calculate discountAmount
//         const discountAmount = (amountBeforeGstAndDiscount * discount) / 100;

//         // Calculate gstAmount
//         const gstAmount = cgstAmount + sgstAmount + igstAmount;
//         const gstAmountForEdprowise =
//           cgstAmountForEdprowise +
//           sgstAmountForEdprowise +
//           igstAmountForEdprowise;

//         // Calculate totalAmount
//         const totalAmountForProduct =
//           amountBeforeGstAndDiscount - discountAmount + gstAmount;
//         const totalAmountForProductForEdprowise =
//           taxableValueForEdprowise + gstAmountForEdprowise;

//         totalQuantity += quantity;
//         totalFinalRateBeforeDiscount += finalRateBeforeDiscount;
//         totalAmountBeforeGstAndDiscount += amountBeforeGstAndDiscount;
//         totalDiscountAmount += discountAmount;
//         totalAmount += totalAmountForProduct;
//         totalTaxableValue += taxableValue;
//         totalCgstAmount += cgstAmount;
//         totalSgstAmount += sgstAmount;
//         totalIgstAmount += igstAmount;
//         totalTaxAmount += gstAmount;
//         totalFinalRate += finalRate;

//         totalFinalRateBeforeDiscountForEdprowise += finalRateBeforeDiscount;
//         totalTaxableValueForEdprowise += taxableValueForEdprowise;
//         totalCgstAmountForEdprowise += cgstAmountForEdprowise;
//         totalSgstAmountForEdprowise += sgstAmountForEdprowise;
//         totalIgstAmountForEdprowise += igstAmountForEdprowise;
//         totalTaxAmountForEdprowise += gstAmountForEdprowise;
//         totalAmountForEdprowise += totalAmountForProductForEdprowise;
//         totalFinalRateForEdprowise += finalRateForEdprowise;

//         const newPrepareQuote = new PrepareQuote({
//           sellerId,
//           enquiryNumber,
//           prepareQuoteImages,
//           subcategoryName: product.subcategoryName,
//           subCategoryId: product.subCategoryId,
//           hsnSacc: product.hsnSacc,
//           listingRate,
//           edprowiseMargin,
//           quantity,
//           finalRateBeforeDiscount,
//           discount,
//           finalRate,
//           taxableValue,
//           cgstRate,
//           sgstRate,
//           igstRate,
//           cgstRateForEdprowise,
//           sgstRateForEdprowise,
//           igstRateForEdprowise,
//           cgstAmount,
//           sgstAmount,
//           igstAmount,
//           amountBeforeGstAndDiscount,
//           discountAmount,
//           gstAmount,
//           totalAmount: totalAmountForProduct,
//           finalRateForEdprowise,
//           taxableValueForEdprowise,
//           cgstAmountForEdprowise,
//           sgstAmountForEdprowise,
//           igstAmountForEdprowise,
//           gstAmountForEdprowise,
//           totalAmountForEdprowise: totalAmountForProductForEdprowise,
//         });

//         // Save the entry
//         const savedEntry = await newPrepareQuote.save({ session });
//         createdEntries.push(savedEntry);
//       }

//       // Generate quote number (pass session to ensure consistency)
//       quoteNumber = await generateQuoteNumber(session);
//       console.log("Generated Quote Number:", quoteNumber);

//       // Create and save QuoteProposal with session
//       savedQuoteProposal = await QuoteProposal.create(
//         [
//           {
//             quoteNumber,
//             sellerId,
//             enquiryNumber,
//             totalQuantity,
//             totalFinalRateBeforeDiscount,
//             totalAmountBeforeGstAndDiscount,
//             totalDiscountAmount,
//             totalAmount,
//             totalTaxableValue,
//             totalCgstAmount,
//             totalSgstAmount,
//             totalIgstAmount,
//             totalTaxAmount,
//             totalFinalRate,
//             // For Edprowise
//             totalFinalRateBeforeDiscountForEdprowise,
//             totalTaxableValueForEdprowise,
//             totalCgstAmountForEdprowise,
//             totalSgstAmountForEdprowise,
//             totalIgstAmountForEdprowise,
//             totalTaxAmountForEdprowise,
//             totalAmountForEdprowise,
//             totalFinalRateForEdprowise,
//             supplierStatus: "Quote Submitted",
//             edprowiseStatus: "Quote Received",
//             buyerStatus: "Quote Requested",
//             orderStatus: "Pending",
//           },
//         ],
//         { session }
//       );

//       // Update QuoteRequest with session
//       await QuoteRequest.findOneAndUpdate(
//         { enquiryNumber },
//         { edprowiseStatus: "Quote Received" },
//         { session }
//       );

//       // Create SubmitQuote with session
//       await SubmitQuote.create(
//         [
//           {
//             sellerId,
//             enquiryNumber,
//             quotedAmount: totalAmount,
//             advanceRequiredAmount: 0,
//           },
//         ],
//         { session }
//       );
//     });

//     await Promise.all([
//       NotificationService.sendNotification(
//         "SELLER_QUOTE_PREPARED",
//         [{ id: sellerId.toString(), type: "seller" }],
//         {
//           quoteNumber,
//           entityId: savedQuoteProposal._id,
//           entityType: "QuoteProposal",
//           senderType: "seller",
//           senderId: sellerId,
//           metadata: {
//             quoteNumber: quoteNumber,
//             type: "quote_prepared",
//           },
//         }
//       ),
//       (async () => {
//         const relevantEdprowise = await AdminUser.find({});
//         await NotificationService.sendNotification(
//           "EDPROWISE_QUOTE_RECEIVED_FROM_SELLER",
//           relevantEdprowise.map((admin) => ({
//             id: admin._id.toString(),
//             type: "edprowise",
//           })),
//           {
//             companyName: sellerProfile.companyName,
//             quoteNumber,
//             entityId: savedQuoteProposal._id,
//             entityType: "QuoteProposal",
//             senderType: "seller",
//             senderId: sellerId,
//             metadata: {
//               quoteNumber: quoteNumber,
//               type: "quote_received_from_seller",
//             },
//           }
//         );
//       })(),
//     ]);

//     return res.status(201).json({
//       hasError: false,
//       message: "Quotes created successfully",
//       data: {
//         prepareQuotes: createdEntries,
//         quoteProposal: savedQuoteProposal,
//         // submitQuote: SubmitQuote,
//       },
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//     return res
//       .status(
//         error.message.includes("Access denied")
//           ? 401
//           : error.message.includes("Required")
//           ? 404
//           : error.message.includes("Enquiry")
//           ? 400
//           : 500
//       )
//       .json({
//         hasError: true,
//         message: error.message,
//       });
//   } finally {
//     await session.endSession();
//   }
// }

async function create(req, res) {
  const session = await mongoose.startSession();
  let savedQuoteProposal;
  let createdEntries = [];
  let sellerId;
  let quoteNumber;
  let sellerProfile;
  let quoteRequest;
  let edprowiseProfile;

  try {
    await session.withTransaction(async () => {
      try {
        sellerId = req.user?.id;

        if (!sellerId) {
          throw new Error(
            "Access denied: You do not have permission to Prepare quote."
          );
        }

        // Validate inputs
        let { enquiryNumber, products } = req.body;

        if (!enquiryNumber) {
          throw new Error("Enquiry number is required.");
        }

        if (typeof products === "string") products = JSON.parse(products);

        if (!Array.isArray(products) || products.length === 0) {
          throw new Error("At least one product must be provided.");
        }

        // Fetch data with session
        [quoteRequest, sellerProfile, edprowiseProfile] = await Promise.all([
          QuoteRequest.findOne({ enquiryNumber }).session(session),
          SellerProfile.findOne({ sellerId }).session(session),
          EdprowiseProfile.findOne().session(session),
        ]);

        if (!quoteRequest || !sellerProfile || !edprowiseProfile) {
          throw new Error("Required profile data not found.");
        }

        // Extract states from location strings
        const schoolState = quoteRequest.deliveryState;
        const sellerState = sellerProfile.state;
        const edprowiseState = edprowiseProfile.state;

        if (!schoolState || !sellerState || !edprowiseState) {
          throw new Error("Location data is incomplete.");
        }

        const uploadedImages = req.files || [];
        createdEntries = [];

        let totalQuantity = 0;
        let totalFinalRateBeforeDiscount = 0;
        let totalTaxableValue = 0;
        let totalCgstAmount = 0;
        let totalSgstAmount = 0;
        let totalIgstAmount = 0;
        let totalTaxAmount = 0;
        let totalAmountBeforeGstAndDiscount = 0;
        let totalDiscountAmount = 0;
        let totalAmount = 0;
        let totalFinalRate = 0;

        let totalFinalRateBeforeDiscountForEdprowise = 0;
        let totalTaxableValueForEdprowise = 0;
        let totalCgstAmountForEdprowise = 0;
        let totalSgstAmountForEdprowise = 0;
        let totalIgstAmountForEdprowise = 0;
        let totalTaxAmountForEdprowise = 0;
        let totalAmountForEdprowise = 0;
        let totalFinalRateForEdprowise = 0;

        for (let i = 0; i < products.length; i++) {
          const product = products[i];

          const { error } = PrepareQuoteValidator.prepareQuoteCreate.validate({
            sellerId,
            enquiryNumber,
            ...product,
          });

          if (error?.details?.length) {
            const errorMessages = error.details
              .map((err) => err.message)
              .join(", ");
            throw new Error(errorMessages);
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
          if (req.files) {
            const imageKeys = Object.keys(req.files).filter((key) => {
              for (let j = 0; j <= 4; j++) {
                if (key.startsWith(`products[${i}][prepareQuoteImages][${j}]`))
                  return true;
              }
              return false;
            });
            imageKeys.forEach((key) => {
              req.files[key].forEach((file) => {
                prepareQuoteImages.push(
                  `/Images/PrepareQuoteImage/${file.filename}`
                );
              });
            });
          }

          // Perform calculations
          const listingRate = parseFloat(product.listingRate);
          const edprowiseMargin = parseFloat(product.edprowiseMargin);
          const quantity = parseFloat(product.quantity);
          const discount = parseFloat(product.discount);

          // Original GST rates from product
          const cgstRate = parseFloat(product.cgstRate) || 0;
          const sgstRate = parseFloat(product.sgstRate) || 0;
          const igstRate = parseFloat(product.igstRate) || 0;

          // Determine GST rates for Edprowise based on location scenarios
          let cgstRateForEdprowise = 0;
          let sgstRateForEdprowise = 0;
          let igstRateForEdprowise = 0;

          // Scenario 1: All locations match
          if (
            schoolState === edprowiseState &&
            edprowiseState === sellerState
          ) {
            cgstRateForEdprowise = cgstRate;
            sgstRateForEdprowise = sgstRate;
            igstRateForEdprowise = igstRate;
          }
          // Scenario 2: School ≠ Edprowise = Seller
          else if (
            schoolState !== edprowiseState &&
            edprowiseState === sellerState
          ) {
            cgstRateForEdprowise = igstRate / 2;
            sgstRateForEdprowise = igstRate / 2;
            igstRateForEdprowise = 0;
          }
          // Scenario 3: All locations different
          else if (
            schoolState !== edprowiseState &&
            edprowiseState !== sellerState
          ) {
            cgstRateForEdprowise = 0;
            sgstRateForEdprowise = 0;
            igstRateForEdprowise = igstRate;
          }
          // Scenario 4: School = Edprowise ≠ Seller
          else if (
            schoolState === edprowiseState &&
            edprowiseState !== sellerState
          ) {
            cgstRateForEdprowise = 0;
            sgstRateForEdprowise = 0;
            igstRateForEdprowise = cgstRate + sgstRate;
          }

          // Calculate finalRateBeforeDiscount
          const finalRateBeforeDiscount =
            listingRate + (listingRate * edprowiseMargin) / 100;

          // Calculate finalRate
          const finalRate =
            finalRateBeforeDiscount -
            (finalRateBeforeDiscount * discount) / 100;

          const finalRateForEdprowise =
            (finalRate / (edprowiseMargin + 100)) * 100;

          // Calculate taxableValue
          const taxableValue = finalRate * quantity;
          const taxableValueForEdprowise = finalRateForEdprowise * quantity;

          // Calculate GST amounts using the determined rates
          const cgstAmount = (taxableValue * cgstRate) / 100;
          const sgstAmount = (taxableValue * sgstRate) / 100;
          const igstAmount = (taxableValue * igstRate) / 100;

          const cgstAmountForEdprowise =
            (taxableValueForEdprowise * cgstRateForEdprowise) / 100;
          const sgstAmountForEdprowise =
            (taxableValueForEdprowise * sgstRateForEdprowise) / 100;
          const igstAmountForEdprowise =
            (taxableValueForEdprowise * igstRateForEdprowise) / 100;

          // Calculate amountBeforeGstAndDiscount
          const amountBeforeGstAndDiscount = finalRateBeforeDiscount * quantity;

          // Calculate discountAmount
          const discountAmount = (amountBeforeGstAndDiscount * discount) / 100;

          // Calculate gstAmount
          const gstAmount = cgstAmount + sgstAmount + igstAmount;
          const gstAmountForEdprowise =
            cgstAmountForEdprowise +
            sgstAmountForEdprowise +
            igstAmountForEdprowise;

          // Calculate totalAmount
          const totalAmountForProduct =
            amountBeforeGstAndDiscount - discountAmount + gstAmount;
          const totalAmountForProductForEdprowise =
            taxableValueForEdprowise + gstAmountForEdprowise;

          totalQuantity += quantity;
          totalFinalRateBeforeDiscount += finalRateBeforeDiscount;
          totalAmountBeforeGstAndDiscount += amountBeforeGstAndDiscount;
          totalDiscountAmount += discountAmount;
          totalAmount += totalAmountForProduct;
          totalTaxableValue += taxableValue;
          totalCgstAmount += cgstAmount;
          totalSgstAmount += sgstAmount;
          totalIgstAmount += igstAmount;
          totalTaxAmount += gstAmount;
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
            subcategoryName: product.subcategoryName,
            subCategoryId: product.subCategoryId,
            hsnSacc: product.hsnSacc,
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

          // Save the entry
          const savedEntry = await newPrepareQuote.save({ session });
          createdEntries.push(savedEntry);
        }

        // Generate quote number (pass session to ensure consistency)
        quoteNumber = await generateQuoteNumber(session);
        console.log("Generated Quote Number:", quoteNumber);

        // Create and save QuoteProposal with session
        savedQuoteProposal = await QuoteProposal.create(
          {
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
            // For Edprowise
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
          },
          { session }
        );

        // Update QuoteRequest with session
        await QuoteRequest.findOneAndUpdate(
          { enquiryNumber },
          { edprowiseStatus: "Quote Received" },
          { session }
        );

        // Create SubmitQuote with session
        await SubmitQuote.create(
          [
            {
              sellerId,
              enquiryNumber,
              quotedAmount: totalAmount,
              advanceRequiredAmount: 0,
            },
          ],
          { session }
        );

        // Send notifications within the same transaction
        await Promise.all([
          NotificationService.sendNotification(
            "SELLER_QUOTE_PREPARED",
            [{ id: sellerId.toString(), type: "seller" }],
            {
              quoteNumber,
              entityId: savedQuoteProposal._id,
              entityType: "QuoteProposal",
              senderType: "seller",
              senderId: sellerId,
              metadata: {
                quoteNumber: quoteNumber,
                type: "quote_prepared",
              },
            }
          ),
          (async () => {
            const relevantEdprowise = await AdminUser.find({}).session(session);
            await NotificationService.sendNotification(
              "EDPROWISE_QUOTE_RECEIVED_FROM_SELLER",
              relevantEdprowise.map((admin) => ({
                id: admin._id.toString(),
                type: "edprowise",
              })),
              {
                companyName: sellerProfile.companyName,
                quoteNumber,
                entityId: savedQuoteProposal._id,
                entityType: "QuoteProposal",
                senderType: "seller",
                senderId: sellerId,
                metadata: {
                  quoteNumber: quoteNumber,
                  type: "quote_received_from_seller",
                },
              }
            );
          })(),
        ]);
      } catch (error) {
        // This will trigger transaction abort
        throw error;
      }
    });

    // Only reach here if transaction succeeds
    return res.status(201).json({
      hasError: false,
      message: "Quotes created successfully",
      data: {
        prepareQuotes: createdEntries,
        quoteProposal: savedQuoteProposal,
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(
        error.message.includes("Access denied")
          ? 401
          : error.message.includes("Required")
          ? 404
          : error.message.includes("Enquiry")
          ? 400
          : 500
      )
      .json({
        hasError: true,
        message: error.message,
      });
  } finally {
    await session.endSession();
  }
}
export default create;
