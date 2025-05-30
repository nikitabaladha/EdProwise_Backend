import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";

async function getBySellerIdAndEnquiryNumber(req, res) {
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

    const quoteProposal = await QuoteProposal.findOne({
      sellerId,
      enquiryNumber,
    });

    if (!quoteProposal) {
      return res.status(404).json({
        hasError: true,
        message:
          "Quote Proposal Not found for the given seller and enquiry number.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Quote Proposal retrieved successfully.",
      data: quoteProposal,
    });
  } catch (error) {
    console.error("Error retrieving Quote Proposal:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default getBySellerIdAndEnquiryNumber;
