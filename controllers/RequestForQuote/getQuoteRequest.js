import QuoteRequest from "../../models/QuoteRequest.js";

async function getQuoteRequest(req, res) {
  try {
    const { enquiryNumber } = req.params;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Enquiry number is required.",
      });
    }

    const quoteRequest = await QuoteRequest.findOne({ enquiryNumber });

    if (!quoteRequest) {
      return res.status(404).json({
        hasError: true,
        message: "Quote request not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Data fetched successfully.",
      data: quoteRequest,
    });
  } catch (error) {
    console.error("Error fetching data by enquiry number:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch data.",
      error: error.message,
    });
  }
}

export default getQuoteRequest;
