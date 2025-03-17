import SubmitQuote from "../../models/SubmitQuote.js";

async function rejectCommentFromBuyer(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;
    const { rejectCommentFromBuyer } = req.body;

    if (!enquiryNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    if (!rejectCommentFromBuyer || rejectCommentFromBuyer.trim() === "") {
      return res.status(400).json({
        hasError: true,
        message: "Comment is required if you want to reject the quote.",
      });
    }

    const updatedQuote = await SubmitQuote.findOneAndUpdate(
      { enquiryNumber, sellerId },
      {
        rejectCommentFromBuyer,
        venderStatusFromBuyer: "Quote Not Accepted",
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
      message: "Quote rejected successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error rejecting quote:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default rejectCommentFromBuyer;
