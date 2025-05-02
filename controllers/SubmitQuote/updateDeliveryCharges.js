import SubmitQuote from "../../models/SubmitQuote.js";
import SubmitQuoteValidator from "../../validators/SubmitQuote.js";

async function updateDeliveryCharges(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;

    if (!enquiryNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    const { error } =
      SubmitQuoteValidator.SubmitQuoteUpdateDeliveryCharges.validate(req.body);
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
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

    const { deliveryCharges } = req.body;

    existingQuote.deliveryCharges =
      deliveryCharges !== undefined
        ? deliveryCharges
        : existingQuote.deliveryCharges;

    const updatedQuote = await existingQuote.save();

    return res.status(200).json({
      hasError: false,
      message: "Submitted Quote updated successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error updating Submitted Quote:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateDeliveryCharges;
