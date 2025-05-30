import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import SellerProfile from "../../../models/SellerProfile.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";

async function getOneByEnquiryNumberAndSellerIdAccordingToStatus(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;

    if (!enquiryNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    const quote = await SubmitQuote.findOne({
      enquiryNumber,
      sellerId,
      venderStatus: "Quote Accepted",
    });

    if (!quote) {
      return res.status(404).json({
        hasError: true,
        message: "No quote found for the given enquiry number and sellerId.",
      });
    }

    const sellerProfile = await SellerProfile.findOne({ sellerId });

    const quoteRequest = await QuoteRequest.findOne({ enquiryNumber });

    const quoteProposal = await QuoteProposal.findOne({
      enquiryNumber,
      sellerId,
    });

    const responseData = {
      ...quote.toObject(),
      companyName: sellerProfile ? sellerProfile.companyName : null,
      buyerStatus: quoteRequest?.buyerStatus || null,
      supplierStatus: quoteRequest?.supplierStatus || null,
      edprowiseStatus: quoteRequest?.edprowiseStatus || null,
      quoteNumber: quoteProposal?.quoteNumber || null,
    };

    return res.status(200).json({
      hasError: false,
      message: "Quote retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default getOneByEnquiryNumberAndSellerIdAccordingToStatus;
