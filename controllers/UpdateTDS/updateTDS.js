import QuoteProposal from "../../models/QuoteProposal.js";

async function updateTDS(req, res) {
  try {
    const { enquiryNumber, quoteNumber } = req.query;
    const { tDSAmount } = req.body;

    if (!enquiryNumber || !quoteNumber) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and quoteNumber are required",
      });
    }

    const allowedTDS = [1, 2, 10, 20.8];

    if (!allowedTDS.includes(tDSAmount)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid TDS amount. Allowed values: ${allowedTDS.join(", ")}`,
      });
    }

    const existingQuoteProposal = await QuoteProposal.findOne({
      enquiryNumber,
      quoteNumber,
    });

    if (!existingQuoteProposal) {
      return res.status(404).json({
        hasError: true,
        message:
          "No Quote Proposal found for the given enquiryNumber and quoteNumber.",
      });
    }

    const finalPayableAmountWithoutTDS =
      existingQuoteProposal.finalPayableAmountWithoutTDS;

    if (
      finalPayableAmountWithoutTDS === undefined ||
      finalPayableAmountWithoutTDS === null
    ) {
      return res.status(400).json({
        hasError: true,
        message: "finalPayableAmountWithoutTDS is missing in the record.",
      });
    }

    // Calculating the final payable amount after TDS deduction
    const finalPayableAmountWithTDS =
      finalPayableAmountWithoutTDS -
      (finalPayableAmountWithoutTDS * tDSAmount) / 100;

    // Updating the values in the database
    existingQuoteProposal.tDSAmount = tDSAmount;
    existingQuoteProposal.finalPayableAmountWithTDS = finalPayableAmountWithTDS;

    await existingQuoteProposal.save();

    return res.status(200).json({
      hasError: false,
      message: "TDS amount updated successfully.",
      data: existingQuoteProposal,
    });
  } catch (error) {
    console.error("Error updating TDS amount:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateTDS;
