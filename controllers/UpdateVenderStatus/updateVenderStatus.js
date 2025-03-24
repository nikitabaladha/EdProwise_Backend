import SubmitQuote from "../../models/SubmitQuote.js";
import QuoteRequest from "../../models/QuoteRequest.js";

async function updateVenderStatus(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;
    const { venderStatus } = req.body;

    if (!enquiryNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    const allowedStatuses = ["Quote Accepted", "Quote Not Accepted"];

    if (!allowedStatuses.includes(venderStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid venderStatus. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const existingQuote = await SubmitQuote.findOne({
      enquiryNumber,
      sellerId,
    });

    if (!existingQuote) {
      return res.status(404).json({
        hasError: true,
        message: "Quote not found for the given enquiryNumber and sellerId.",
      });
    }

    const existingQuoteRequest = await QuoteRequest.findOne({
      enquiryNumber,
    });

    if (!existingQuoteRequest) {
      return res.status(404).json({
        hasError: true,
        message: "Quote not found for the given enquiryNumber.",
      });
    }

    existingQuote.venderStatus = venderStatus;
    await existingQuote.save();

    if (venderStatus === "Quote Accepted") {
      existingQuoteRequest.buyerStatus = "Quote Received";

      await existingQuoteRequest.save();
    }
    return res.status(200).json({
      hasError: false,
      message: "Quote status updated successfully.",
      data: existingQuote,
    });
  } catch (error) {
    console.error("Error updating quote status:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateVenderStatus;
