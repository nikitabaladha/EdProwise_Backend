// import SubmitQuote from "../../models/SubmitQuote.js";
// import SubmitQuoteValidator from "../../validators/SubmitQuote.js";
// import QuoteProposal from "../../models/QuoteProposal.js";
// import QuoteRequest from "../../models/QuoteRequest.js";

// async function updateBySellerIdAndEnquiryNumber(req, res) {
//   try {
//     const { enquiryNumber, sellerId } = req.query;

//     if (!enquiryNumber || !sellerId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "enquiryNumber and sellerId are required.",
//       });
//     }

//     const { error } = SubmitQuoteValidator.SubmitQuoteUpdate.validate(req.body);
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

//     const {
//       quotedAmount,
//       description,
//       remarksFromSupplier,
//       expectedDeliveryDateBySeller,
//       paymentTerms,
//       advanceRequiredAmount,
//     } = req.body;

//     existingQuote.quotedAmount =
//       quotedAmount !== undefined ? quotedAmount : existingQuote.quotedAmount;
//     existingQuote.description =
//       description !== undefined ? description : existingQuote.description;
//     existingQuote.remarksFromSupplier =
//       remarksFromSupplier !== undefined
//         ? remarksFromSupplier
//         : existingQuote.remarksFromSupplier;
//     existingQuote.expectedDeliveryDateBySeller =
//       expectedDeliveryDateBySeller !== undefined
//         ? expectedDeliveryDateBySeller
//         : existingQuote.expectedDeliveryDateBySeller;
//     existingQuote.paymentTerms =
//       paymentTerms !== undefined ? paymentTerms : existingQuote.paymentTerms;
//     existingQuote.advanceRequiredAmount =
//       advanceRequiredAmount !== undefined
//         ? advanceRequiredAmount
//         : existingQuote.advanceRequiredAmount;

//     if (advanceRequiredAmount !== undefined) {
//       const quoteProposal = await QuoteProposal.findOne({
//         enquiryNumber,
//         sellerId,
//       });

//       if (!quoteProposal) {
//         return res.status(404).json({
//           hasError: true,
//           message:
//             "Quote Proposal not found for the given enquiryNumber and sellerId.",
//         });
//       }

//       const finalPayableAmountWithoutTDS =
//         quoteProposal.totalAmount - advanceRequiredAmount;
//       const finalPayableAmountWithTDS =
//         finalPayableAmountWithoutTDS -
//         (finalPayableAmountWithoutTDS * quoteProposal.tDSAmount) / 100;

//       quoteProposal.finalPayableAmountWithoutTDS = finalPayableAmountWithoutTDS;
//       quoteProposal.finalPayableAmountWithTDS = finalPayableAmountWithTDS;

//       await quoteProposal.save();
//     }

//     const updatedQuote = await existingQuote.save();

//     const updatedQuoteRequest = await QuoteRequest.findOneAndUpdate(
//       { enquiryNumber },
//       {
//         supplierStatus: "Quote Submitted",
//         edprowiseStatus: "Quote Received",
//       },
//       { new: true }
//     );

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

// export default updateBySellerIdAndEnquiryNumber;

import SubmitQuote from "../../models/SubmitQuote.js";
import SubmitQuoteValidator from "../../validators/SubmitQuote.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import QuoteRequest from "../../models/QuoteRequest.js";

async function updateBySellerIdAndEnquiryNumber(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;

    if (!enquiryNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    const { error } = SubmitQuoteValidator.SubmitQuoteUpdate.validate(req.body);
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
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

    const {
      quotedAmount,
      description,
      remarksFromSupplier,
      expectedDeliveryDateBySeller,
      paymentTerms,
      advanceRequiredAmount,
    } = req.body;

    existingQuote.quotedAmount =
      quotedAmount !== undefined ? quotedAmount : existingQuote.quotedAmount;
    existingQuote.description =
      description !== undefined ? description : existingQuote.description;
    existingQuote.remarksFromSupplier =
      remarksFromSupplier !== undefined
        ? remarksFromSupplier
        : existingQuote.remarksFromSupplier;
    existingQuote.expectedDeliveryDateBySeller =
      expectedDeliveryDateBySeller !== undefined
        ? expectedDeliveryDateBySeller
        : existingQuote.expectedDeliveryDateBySeller;
    existingQuote.paymentTerms =
      paymentTerms !== undefined ? paymentTerms : existingQuote.paymentTerms;
    existingQuote.advanceRequiredAmount =
      advanceRequiredAmount !== undefined
        ? advanceRequiredAmount
        : existingQuote.advanceRequiredAmount;

    if (advanceRequiredAmount !== undefined) {
      const quoteProposal = await QuoteProposal.findOne({
        enquiryNumber,
        sellerId,
      });

      if (!quoteProposal) {
        return res.status(404).json({
          hasError: true,
          message:
            "Quote Proposal not found for the given enquiryNumber and sellerId.",
        });
      }

      const finalPayableAmountWithoutTDS =
        quoteProposal.totalAmount - advanceRequiredAmount;
      const finalPayableAmountWithTDS =
        finalPayableAmountWithoutTDS -
        (finalPayableAmountWithoutTDS * quoteProposal.tDSAmount) / 100;

      quoteProposal.finalPayableAmountWithoutTDS = finalPayableAmountWithoutTDS;
      quoteProposal.finalPayableAmountWithTDS = finalPayableAmountWithTDS;

      await quoteProposal.save();
    }

    const updatedQuote = await existingQuote.save();

    const updatedQuoteProposal = await QuoteProposal.findOneAndUpdate(
      { enquiryNumber, sellerId },
      {
        supplierStatus: "Quote Submitted",
        edprowiseStatus: "Quote Received",
      },
      { new: true }
    );

    return res.status(200).json({
      hasError: false,
      message: "Submitted Quote updated successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error updating Submitted Quote:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateBySellerIdAndEnquiryNumber;
