import QuoteProposal from "../../models/QuoteProposal.js";

async function requestForOrderCancelByBuyer(req, res) {
  try {
    const { enquiryNumber, sellerId, schoolId } = req.query;
    const { cancelReasonFromBuyer } = req.body;

    if (!enquiryNumber || !sellerId || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber, sellerId and schoolId are required.",
      });
    }

    if (!cancelReasonFromBuyer || cancelReasonFromBuyer.trim() === "") {
      return res.status(400).json({
        hasError: true,
        message: "Comment is required if you want to request for order cancel.",
      });
    }

    const updatedQuote = await QuoteProposal.findOneAndUpdate(
      { enquiryNumber, sellerId },
      {
        cancelReasonFromBuyer,
        buyerStatus: "Requested For Cancel",
      },
      { new: true }
    );

    if (!updatedQuote) {
      return res.status(404).json({
        hasError: true,
        message: "Quote not found for the given enquiryNumber and sellerId.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Order cancel requested successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error cancelling order request:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default requestForOrderCancelByBuyer;
