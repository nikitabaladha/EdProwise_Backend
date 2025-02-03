import SubmitQuote from "../../models/SubmitQuote.js";
import SellerProfile from "../../models/SellerProfile.js";
import QuoteRequest from "../../models/QuoteRequest.js";
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

    const sellerIds = quotes.map((quote) => quote.sellerId);
    const sellerProfiles = await SellerProfile.find({
      sellerId: { $in: sellerIds },
    });

    const sellerProfileMap = sellerProfiles.reduce((acc, profile) => {
      acc[profile.sellerId] = profile.companyName;
      return acc;
    }, {});

    const quotesWithCompanyName = quotes.map((quote) => ({
      ...quote.toObject(),
      companyName: sellerProfileMap[quote.sellerId] || null,
      buyerStatus: quoteRequest?.buyerStatus || null,
      supplierStatus: quoteRequest?.supplierStatus || null,
      edprowiseStatus: quoteRequest?.edprowiseStatus || null,
    }));

    return res.status(200).json({
      hasError: false,
      message: "Quotes retrieved successfully.",
      data: quotesWithCompanyName,
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
