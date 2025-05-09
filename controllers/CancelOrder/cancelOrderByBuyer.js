import QuoteProposal from "../../models/QuoteProposal.js";

async function CancelOrderByBuyer(req, res) {
  try {
    const { enquiryNumber, sellerId, schoolId } = req.query;
    const { buyerStatus } = req.body;

    if (!enquiryNumber || !sellerId || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber, sellerId and schoolId are required.",
      });
    }

    const allowedStatuses = ["Cancelled by Buyer"];

    if (!allowedStatuses.includes(buyerStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid buyerStatus. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const existingQuote = await QuoteProposal.findOne({
      enquiryNumber,
      sellerId,
    });

    if (!existingQuote) {
      return res.status(404).json({
        hasError: true,
        message:
          "Quote not found for the given enquiryNumber,sellerId and schoolId.",
      });
    }

    // Update the orderStatus
    existingQuote.buyerStatus = buyerStatus;
    existingQuote.supplierStatus = buyerStatus;
    existingQuote.edprowiseStatus = buyerStatus;

    // Save the updated QuoteProposal
    const updatedQuote = await existingQuote.save();

    return res.status(200).json({
      hasError: false,
      message: "Order Cancelled by school successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error Cancelling Order by School.", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default CancelOrderByBuyer;
