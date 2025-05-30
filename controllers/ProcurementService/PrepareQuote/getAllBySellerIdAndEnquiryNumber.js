import PrepareQuote from "../../../models/ProcurementService/PrepareQuote.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";

async function getAllBySellerIdAndEnquiryNumber(req, res) {
  try {
    const { sellerId, enquiryNumber } = req.query;

    if (!sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "Seller ID is required.",
      });
    }

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Enquiry number is required.",
      });
    }

    const prepareQuotes = await PrepareQuote.find({ sellerId, enquiryNumber });

    if (!prepareQuotes.length) {
      return res.status(404).json({
        hasError: true,
        message: "No quotes found for the given seller and enquiry number.",
      });
    }

    const quoteProposal = await QuoteProposal.findOne({
      sellerId,
      enquiryNumber,
    });

    // Add supplierStatus to each PrepareQuote object
    const prepareQuotesWithStatus = prepareQuotes.map((quote) => ({
      ...quote.toObject(),
      supplierStatus: quoteProposal ? quoteProposal.supplierStatus : null,
    }));

    return res.status(200).json({
      hasError: false,
      message: "Prepare quotes retrieved successfully.",
      data: prepareQuotesWithStatus,
    });
  } catch (error) {
    console.error("Error retrieving Prepare quotes:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default getAllBySellerIdAndEnquiryNumber;
