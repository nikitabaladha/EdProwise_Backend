import SubmitQuote from "../../models/SubmitQuote.js";
import SubmitQuoteValidator from "../../validators/SubmitQuote.js";
import QuoteProposal from "../../models/QuoteProposal.js";

import mongoose from "mongoose";

async function updateBySellerIdAndEnquiryNumber(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
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

    const existingQuoteProposal = await QuoteProposal.findOne({
      enquiryNumber,
      sellerId,
    }).session(session);

    if (!existingQuoteProposal) {
      return res.status(404).json({
        hasError: true,
        message: `Quote Proposal not found for the given enquiryNumber and sellerId.`,
      });
    }

    const createdAt = existingQuoteProposal.createdAt;
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;

    if (timeDifference > fourHoursInMilliseconds) {
      return res.status(403).json({
        hasError: true,
        message: "Update not allowed after 4 hours from creation time.",
      });
    }

    const {
      quotedAmount,
      description,
      remarksFromSupplier,
      expectedDeliveryDateBySeller,
      paymentTerms,
      advanceRequiredAmount,
      deliveryCharges,
    } = req.body;

    existingQuote.quotedAmount =
      quotedAmount !== undefined ? quotedAmount : existingQuote.quotedAmount;
    existingQuote.deliveryCharges =
      deliveryCharges !== undefined
        ? deliveryCharges
        : existingQuote.deliveryCharges;
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
      }).session(session);

      if (!quoteProposal) {
        return res.status(404).json({
          hasError: true,
          message:
            "Quote Proposal not found for the given enquiryNumber and sellerId.",
        });
      }

      const tdsValue =
        quoteProposal.totalTaxableValue * (quoteProposal.tDSAmount / 100);

      const tdsValueForEdprowise =
        quoteProposal.totalTaxableValueForEdprowise *
        (quoteProposal.tDSAmount / 100);

      const finalPayableAmountWithTDS =
        quoteProposal.totalAmount - advanceRequiredAmount - tdsValue;

      const finalPayableAmountWithTDSForEdprowise =
        quoteProposal.totalAmountForEdprowise -
        advanceRequiredAmount -
        tdsValueForEdprowise;

      quoteProposal.tdsValue = tdsValue;
      quoteProposal.tdsValueForEdprowise = tdsValueForEdprowise;

      quoteProposal.finalPayableAmountWithTDS = finalPayableAmountWithTDS;
      quoteProposal.finalPayableAmountWithTDSForEdprowise =
        finalPayableAmountWithTDSForEdprowise;

      await quoteProposal.save({ session });
    }

    const updatedQuote = await existingQuote.save({ session });

    await QuoteProposal.findOneAndUpdate(
      { enquiryNumber, sellerId },
      {
        supplierStatus: "Quote Submitted",
        edprowiseStatus: "Quote Received",
        buyerStatus: "Quote Received",
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: "Submitted Quote updated successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();

    console.error("Error updating Submitted Quote:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateBySellerIdAndEnquiryNumber;
