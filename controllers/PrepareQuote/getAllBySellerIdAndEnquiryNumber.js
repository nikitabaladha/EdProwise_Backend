import PrepareQuote from "../../models/PrepareQuote.js";

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

    return res.status(200).json({
      hasError: false,
      message: "Prepare quotes retrieved successfully.",
      data: prepareQuotes,
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
