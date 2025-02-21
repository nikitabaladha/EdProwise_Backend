import SubmitQuote from "../../models/SubmitQuote.js";
import SubmitQuoteValidator from "../../validators/SubmitQuote.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import QuoteProposal from "../../models/QuoteProposal.js";

async function create(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request a quote.",
      });
    }

    const { error } = SubmitQuoteValidator.SubmitQuoteCreate.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const {
      enquiryNumber,
      quotedAmount,
      description,
      remarksFromSupplier,
      expectedDeliveryDateBySeller,
      paymentTerms,
      advanceRequiredAmount,
    } = req.body;

    const newSubmitQuote = new SubmitQuote({
      sellerId,
      enquiryNumber,
      quotedAmount,
      description,
      remarksFromSupplier,
      expectedDeliveryDateBySeller,
      paymentTerms,
      advanceRequiredAmount,
      venderStatus: "Pending",
    });

    const savedQuote = await newSubmitQuote.save();

    const updatedQuoteRequest = await QuoteRequest.findOneAndUpdate(
      { enquiryNumber },
      {
        supplierStatus: "Quote Submitted",
        edprowiseStatus: "Quote Received From Supplier",
      },
      { new: true }
    );

    const quoteProposal = await QuoteProposal.findOne({
      enquiryNumber,
      sellerId,
    });

    if (!quoteProposal) {
      return res.status(404).json({
        hasError: true,
        message: "Quote Proposal not found.",
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

    return res.status(201).json({
      hasError: false,
      message: "Quote submitted successfully.",
      data: savedQuote,
      updatedQuoteRequest,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message:
          "Duplicate entry: A submit quote from this seller for the same enquiry already exists.",
      });
    }
    console.error("Error creating Prepare quotes:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default create;
