// import SubmitQuote from "../../models/SubmitQuote.js";
// import SubmitQuoteValidator from "../../validators/SubmitQuote.js";
// import QuoteProposal from "../../models/QuoteProposal.js";
// import QuoteRequest from "../../models/QuoteRequest.js";
// import SellerProfile from "../../models/SellerProfile.js";
// import EdprowiseProfile from "../../models/EdprowiseProfile.js";

// async function updateDeliveryCharges(req, res) {
//   try {
//     const { enquiryNumber, sellerId } = req.query;

//     if (!enquiryNumber || !sellerId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "enquiryNumber and sellerId are required.",
//       });
//     }

//     const { error } =
//       SubmitQuoteValidator.SubmitQuoteUpdateDeliveryCharges.validate(req.body);
//     if (error?.details?.length) {
//       const errorMessages = error.details.map((err) => err.message).join(", ");
//       return res.status(400).json({ hasError: true, message: errorMessages });
//     }

//     const existingQuote = await SubmitQuote.findOne({
//       enquiryNumber,
//       sellerId,
//     });

//     if (!existingQuote) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Quote not found for the given enquiryNumber and sellerId.",
//       });
//     }

//     const { deliveryCharges } = req.body;

//     existingQuote.deliveryCharges =
//       deliveryCharges !== undefined
//         ? deliveryCharges
//         : existingQuote.deliveryCharges;

//     const updatedQuote = await existingQuote.save();

//     const existingQuoteProposal = await QuoteProposal.findOne({
//       enquiryNumber,
//       sellerId,
//     });

//     if (!existingQuoteProposal) {
//       return res.status(404).json({
//         hasError: true,
//         message:
//           "Quote Proposal not found for the given enquiryNumber and sellerId.",
//       });
//     }

//     // Fetch location data for all parties
//     const [quoteRequest, sellerProfile, edprowiseProfile] = await Promise.all([
//       QuoteRequest.findOne({ enquiryNumber }).session(session),
//       SellerProfile.findOne({ sellerId }).session(session),
//       EdprowiseProfile.findOne().session(session),
//     ]);

//     if (!quoteRequest || !sellerProfile || !edprowiseProfile) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         hasError: true,
//         message: "Required profile data not found.",
//       });
//     }

//     // Extract states from location strings
//     const schoolState = quoteRequest.deliveryState;
//     const sellerState = sellerProfile.state;
//     const edprowiseState = edprowiseProfile.state;

//     if (!schoolState || !sellerState || !edprowiseState) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Location data is incomplete.",
//       });
//     }

//     // According to loaction i want to store rate in quoteProposal database
//     // Determine GST rates for Edprowise based on location scenarios
//     let deliveryCgstRate = 0;
//     let deliverySgstRate = 0;
//     let deliveryIgstRate = 0;

//     // Scenario 1: All locations match
// if (schoolState === edprowiseState && edprowiseState === sellerState) {
//   deliveryCgstRate = 9;
//   deliverySgstRate = 9;
//   deliveryIgstRate = 0;
// }
// // Scenario 2: School ≠ Edprowise = Seller
// else if (schoolState !== edprowiseState && edprowiseState === sellerState) {
//   deliveryCgstRate = 9;
//   deliverySgstRate = 9;
//   deliveryIgstRate = 0;
// }
// // Scenario 3: All locations different
// else if (schoolState !== edprowiseState && edprowiseState !== sellerState) {
//   deliveryCgstRate = 0;
//   deliverySgstRate = 0;
//   deliveryIgstRate = 18;
// }
// // Scenario 4: School = Edprowise ≠ Seller
// else if (schoolState === edprowiseState && edprowiseState !== sellerState) {
//   deliveryCgstRate = 0;
//   deliverySgstRate = 0;
//   deliveryIgstRate = 18;
// }

//     // ===============================

//     const totalDeliveryGstAmount =
//       (existingQuoteProposal.totalTaxAmount /
//         existingQuoteProposal.totalTaxableValue) *
//       existingQuote.deliveryCharges;

//     const totalDeliveryGstAmountForEdprowise =
//       (existingQuoteProposal.totalTaxAmountForEdprowise /
//         existingQuoteProposal.totalTaxableValueForEdprowise) *
//       existingQuote.deliveryCharges;

//     // Update the QuoteProposal with the new values
//     existingQuoteProposal.totalDeliveryGstAmount = totalDeliveryGstAmount;
//     existingQuoteProposal.totalDeliveryGstAmountForEdprowise =
//       totalDeliveryGstAmountForEdprowise;

//     const updatedQuoteProposal = await existingQuoteProposal.save();

//     return res.status(200).json({
//       hasError: false,
//       message: "Submitted Quote updated successfully.",
//       data: updatedQuote,
//     });
//   } catch (error) {
//     console.error("Error updating Submitted Quote:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal server error.",
//     });
//   }
// }

// export default updateDeliveryCharges;

import SubmitQuote from "../../models/SubmitQuote.js";
import SubmitQuoteValidator from "../../validators/SubmitQuote.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import SellerProfile from "../../models/SellerProfile.js";
import EdprowiseProfile from "../../models/EdprowiseProfile.js";

import mongoose from "mongoose";

async function updateDeliveryCharges(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { enquiryNumber, sellerId } = req.query;

    if (!enquiryNumber || !sellerId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    const { error } =
      SubmitQuoteValidator.SubmitQuoteUpdateDeliveryCharges.validate(req.body);
    if (error?.details?.length) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    // Find and update SubmitQuote
    const existingQuote = await SubmitQuote.findOneAndUpdate(
      { enquiryNumber, sellerId },
      { deliveryCharges: req.body.deliveryCharges },
      { new: true, session }
    );

    if (!existingQuote) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Quote not found for the given enquiryNumber and sellerId.",
      });
    }

    // Fetch all required data in parallel
    const [
      quoteRequest,
      sellerProfile,
      edprowiseProfile,
      existingQuoteProposal,
    ] = await Promise.all([
      QuoteRequest.findOne({ enquiryNumber }).session(session),
      SellerProfile.findOne({ sellerId }).session(session),
      EdprowiseProfile.findOne().session(session),
      QuoteProposal.findOne({ enquiryNumber, sellerId }).session(session),
    ]);

    if (
      !quoteRequest ||
      !sellerProfile ||
      !edprowiseProfile ||
      !existingQuoteProposal
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Required data not found.",
      });
    }

    // Extract states
    const schoolState = quoteRequest.deliveryState;
    const sellerState = sellerProfile.state;
    const edprowiseState = edprowiseProfile.state;

    if (!schoolState || !sellerState || !edprowiseState) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Location data is incomplete.",
      });
    }

    // Determine GST rates based on location scenarios
    let deliveryCgstRate = 0;
    let deliverySgstRate = 0;
    let deliveryIgstRate = 0;

    // done
    if (schoolState === edprowiseState && edprowiseState === sellerState) {
      deliveryCgstRate = 9;
      deliverySgstRate = 9;
      deliveryIgstRate = 0;
    }
    // Scenario 2: School ≠ Edprowise = Seller ===done
    else if (schoolState !== edprowiseState && edprowiseState === sellerState) {
      deliveryCgstRate = 0;
      deliverySgstRate = 0;
      deliveryIgstRate = 18;
    }
    // Scenario 3: All locations different ====done
    else if (schoolState !== edprowiseState && edprowiseState !== sellerState) {
      deliveryCgstRate = 0;
      deliverySgstRate = 0;
      deliveryIgstRate = 18;
    }
    // Scenario 4: School = Edprowise ≠ Seller
    else if (schoolState === edprowiseState && edprowiseState !== sellerState) {
      deliveryCgstRate = 9;
      deliverySgstRate = 9;
      deliveryIgstRate = 0;
    }

    // Calculate GST amounts
    const deliveryCharges = existingQuote.deliveryCharges || 0;
    const totalDeliveryGstAmount =
      (deliveryCharges *
        (deliveryCgstRate + deliverySgstRate + deliveryIgstRate)) /
      100;

    // Update QuoteProposal
    const updatedQuoteProposal = await QuoteProposal.findOneAndUpdate(
      { enquiryNumber, sellerId },
      {
        totalDeliveryGstAmount,
        totalDeliveryGstAmountForEdprowise: totalDeliveryGstAmount,
        deliveryCgstRate,
        deliverySgstRate,
        deliveryIgstRate,
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: "Delivery charges updated successfully.",
      data: {
        submitQuote: existingQuote,
        quoteProposal: updatedQuoteProposal,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating delivery charges:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateDeliveryCharges;
