import QuoteProposal from "../../models/QuoteProposal.js";

async function CancelOrderByEdprowise(req, res) {
  try {
    const { enquiryNumber, sellerId, schoolId } = req.query;
    const { edprowiseStatus } = req.body;

    if (!enquiryNumber || !sellerId || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber, sellerId and schoolId are required.",
      });
    }

    const allowedStatuses = ["Cancelled"];

    if (!allowedStatuses.includes(edprowiseStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid EdprowiseStatus. Allowed values: ${allowedStatuses.join(
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
    existingQuote.buyerStatus = edprowiseStatus;
    existingQuote.supplierStatus = edprowiseStatus;
    existingQuote.edprowiseStatus = edprowiseStatus;

    // Save the updated QuoteProposal
    const updatedQuote = await existingQuote.save();

    return res.status(200).json({
      hasError: false,
      message: "Order Cancelled by Edprowise successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error Cancelling Order by Edprowise.", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default CancelOrderByEdprowise;
