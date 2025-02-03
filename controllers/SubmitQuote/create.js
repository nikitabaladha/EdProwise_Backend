import SubmitQuote from "../../models/SubmitQuote.js";
import SubmitQuoteValidator from "../../validators/SubmitQuote.js";
import QuoteRequest from "../../models/QuoteRequest.js";

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

    if (!updatedQuoteRequest) {
      return res.status(404).json({
        hasError: true,
        message: "QuoteRequest not found.",
      });
    }

    return res.status(201).json({
      hasError: false,
      message: "Quote submitted successfully.",
      data: savedQuote,
      updatedQuoteRequest,
    });
  } catch (error) {
    console.error("Error submitting quotes:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default create;
