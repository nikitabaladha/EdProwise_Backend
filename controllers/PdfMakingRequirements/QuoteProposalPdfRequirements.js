import SchoolRegistration from "../../models/School.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";

async function QuoteProposalPdfRequirements(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    // Fetch School details
    const school = await SchoolRegistration.findById(id).select(
      "schoolName schoolMobileNo panNo"
    );

    if (!school) {
      return res.status(404).json({
        hasError: true,
        message: "School not found with the provided ID.",
      });
    }

    // Fetch Quote Request details
    const quoteRequest = await QuoteRequest.findOne({ schoolId: id }).select(
      "deliveryAddress deliveryLandMark deliveryLocation createdAt enquiryNumber"
    );

    // Fetch Quote Proposal details
    const quoteProposal = await QuoteProposal.findOne({
      enquiryNumber: quoteRequest?.enquiryNumber,
    }).select("quoteNumber createdAt");

    // Fetch Submit Quote details
    const submitQuote = await SubmitQuote.findOne({
      enquiryNumber: quoteRequest?.enquiryNumber,
    }).select(
      "paymentTerms advanceRequiredAmount expectedDeliveryDateBySeller"
    );

    return res.status(200).json({
      message: "School details retrieved successfully!",
      data: {
        buyerName: school?.schoolName,
        schoolContactNumber: school?.schoolMobileNo,
        schoolPanNumber: school?.panNo,
        deliveryAddress: `${quoteRequest?.deliveryAddress || ""} ${
          quoteRequest?.deliveryLandMark
            ? `, ${quoteRequest.deliveryLandMark}`
            : ""
        }`.trim(),
        deliveryLocation: quoteRequest?.deliveryLocation,
        quoteRequestedDate: quoteRequest?.createdAt,
        enquiryNumber: quoteRequest?.enquiryNumber,
        quoteNumber: quoteProposal?.quoteNumber,
        quoteProposalDate: quoteProposal?.createdAt,
        paymentTerms: submitQuote?.paymentTerms,
        advanceRequiredAmount: submitQuote?.advanceRequiredAmount,
        expectedDeliveryDate: submitQuote?.expectedDeliveryDateBySeller,
      },
      hasError: false,
    });
  } catch (error) {
    console.error("Error retrieving School Profile:", error);
    return res.status(500).json({
      message: "Failed to retrieve School Profile.",
      error: error.message,
    });
  }
}

export default QuoteProposalPdfRequirements;
