
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";


async function updateTDS(req, res) {
  try {
    const { enquiryNumber, quoteNumber, sellerId } = req.query;
    const { tDSAmount } = req.body;


    if (!enquiryNumber || !quoteNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber, quoteNumber, and sellerId are required",
      });
    }

  
    const allowedTDS = [0, 1, 2, 10, 20.8];
    if (!allowedTDS.includes(tDSAmount)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid TDS amount. Allowed values: ${allowedTDS.join(", ")}`,
      });
    }

   
    const existingQuoteProposal = await QuoteProposal.findOne({
      enquiryNumber,
      quoteNumber,
      sellerId,
    });

    
    if (!existingQuoteProposal) {
      return res.status(404).json({
        hasError: true,
        message:
          "No Quote Proposal found for the given enquiryNumber, quoteNumber, and sellerId.",
      });
    }

    const existingSubmitQuote = await SubmitQuote.findOne({
      enquiryNumber,
      sellerId,
    });

    if (!existingSubmitQuote) {
      return res.status(404).json({
        hasError: true,
        message: "No Submit Quote found for the given enquiryNumber and sellerId.",
      });
    }

    const tdsValue = (existingQuoteProposal.totalTaxableValue * (tDSAmount / 100));
      
   const finalPayableAmountWithTDS =
    existingQuoteProposal.totalAmountBeforeGstAndDiscount - existingSubmitQuote.advanceRequiredAmount - tdsValue;
  
    existingQuoteProposal.tDSAmount = tDSAmount;
    existingQuoteProposal.tdsValue= tdsValue;
    existingQuoteProposal.finalPayableAmountWithTDS = finalPayableAmountWithTDS;

    // Save the updated QuoteProposal
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
