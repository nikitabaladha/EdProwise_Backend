import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import SellerProfile from "../../../models/SellerProfile.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";

async function getAllByEnquiryNumber(req, res) {
  try {
    const { enquiryNumber } = req.params;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Enquiry number is required.",
      });
    }

    const quotes = await SubmitQuote.find({ enquiryNumber });

    if (!quotes.length) {
      return res.status(404).json({
        hasError: true,
        message: "No quotes found for the given enquiry number.",
      });
    }

    const quoteRequest = await QuoteRequest.findOne({ enquiryNumber });

    const buyerStatus = quoteRequest?.buyerStatus || null;

    const edprowiseStatus = quoteRequest?.edprowiseStatus || null;

    const sellerIds = quotes.map((quote) => quote.sellerId);

    const sellerProfiles = await SellerProfile.find({
      sellerId: { $in: sellerIds },
    });

    const sellerProfileMap = sellerProfiles.reduce((acc, profile) => {
      acc[profile.sellerId] = profile.companyName;
      return acc;
    }, {});

    const quoteProposals = await QuoteProposal.find({
      enquiryNumber,
      sellerId: { $in: sellerIds },
    });

    // i want quoteNumber from quoteProposal Table
    const statusMap = quoteProposals.reduce((acc, proposal) => {
      acc[proposal.sellerId] = {
        supplierStatus: proposal.supplierStatus,
        quoteNumber: proposal.quoteNumber,
      };
      return acc;
    }, {});

    const quotesWithDetails = quotes.map((quote) => ({
      ...quote.toObject(),
      companyName: sellerProfileMap[quote.sellerId] || null,
      buyerStatus: buyerStatus || null,
      supplierStatus: statusMap[quote.sellerId]?.supplierStatus || null,
      edprowiseStatus: edprowiseStatus || null,
      quoteNumber: statusMap[quote.sellerId]?.quoteNumber || null,
    }));

    return res.status(200).json({
      hasError: false,
      message: "Quotes retrieved successfully.",
      data: quotesWithDetails,
    });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default getAllByEnquiryNumber;
