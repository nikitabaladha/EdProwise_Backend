// import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
// import OrderDetailsFromSellerValidator from "../../validators/OrderDetailsFromSeller.js";
// import QuoteProposal from "../../models/QuoteProposal.js";
// import SubmitQuote from "../../models/SubmitQuote.js";

// async function updateByOrderNumber(req, res) {
//   try {
//     const { orderNumber } = req.query;

//     if (!orderNumber) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Order Number is required.",
//       });
//     }

//     const { error, value } =
//       OrderDetailsFromSellerValidator.orderDetailsFromSellerUpdate.validate(
//         req.body
//       );

//     if (error) {
//       const errorMessages = error.details.map((err) => err.message).join(", ");
//       return res.status(400).json({ hasError: true, message: errorMessages });
//     }

//     const existingOrder = await OrderDetailsFromSeller.findOne({ orderNumber });

//     if (!existingOrder) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Order not found.",
//       });
//     }

//     const updatedData = {
//       actualDeliveryDate:
//         value.actualDeliveryDate ?? existingOrder.actualDeliveryDate ?? null,
//       otherCharges: value.otherCharges ?? existingOrder.otherCharges ?? 0,
//       finalReceivableFromEdprowise:
//         value.finalReceivableFromEdprowise ??
//         existingOrder.finalReceivableFromEdprowise ??
//         0,
//     };

//     const updatedOrderDetails = await OrderDetailsFromSeller.findOneAndUpdate(
//       { orderNumber },
//       updatedData,
//       { new: true }
//     );

//     // Fetch the sellerId and enquiryNumber from the updated order details
//     const { sellerId, enquiryNumber } = updatedOrderDetails;

//     // Find the corresponding QuoteProposal and SubmitQuote
//     const existingQuoteProposal = await QuoteProposal.findOne({
//       sellerId,
//       enquiryNumber,
//     });

//     const existingSubmitQuote = await SubmitQuote.findOne({
//       sellerId,
//       enquiryNumber,
//     });

//     if (!existingQuoteProposal || !existingSubmitQuote) {
//       return res.status(404).json({
//         hasError: true,
//         message:
//           "No Quote Proposal or Submit Quote found for the given enquiryNumber and sellerId.",
//       });
//     }

//     // Calculate the final payable amount with TDS
//     const finalPayableAmountWithTDS =
//       existingQuoteProposal.totalAmount -
//       existingSubmitQuote.advanceRequiredAmount -
//       existingQuoteProposal.tdsValue +
//       updatedData.otherCharges;

//     const finalPayableAmountWithTDSForEdprowise =
//       existingQuoteProposal.totalAmountForEdprowise -
//       existingSubmitQuote.advanceRequiredAmount -
//       existingQuoteProposal.tdsValueForEdprowise +
//       updatedData.otherCharges;

//     await QuoteProposal.findOneAndUpdate(
//       { sellerId, enquiryNumber },
//       { finalPayableAmountWithTDS, finalPayableAmountWithTDSForEdprowise },
//       { new: true }
//     );

//     return res.status(200).json({
//       message: "Order details updated successfully!",
//       data: updatedOrderDetails,
//       hasError: false,
//     });
//   } catch (error) {
//     console.error("Error updating Order details:", error);
//     return res.status(500).json({
//       message: "Failed to update Order Details.",
//       error: error.message,
//     });
//   }
// }

// export default updateByOrderNumber;

import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import OrderDetailsFromSellerValidator from "../../validators/OrderDetailsFromSeller.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";

async function updateByOrderNumber(req, res) {
  try {
    const { orderNumber } = req.query;

    if (!orderNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Order Number is required.",
      });
    }

    const { error, value } =
      OrderDetailsFromSellerValidator.orderDetailsFromSellerUpdate.validate(
        req.body
      );

    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const existingOrder = await OrderDetailsFromSeller.findOne({ orderNumber });

    if (!existingOrder) {
      return res.status(404).json({
        hasError: true,
        message: "Order not found.",
      });
    }

    const updatedData = {
      actualDeliveryDate:
        value.actualDeliveryDate ?? existingOrder.actualDeliveryDate ?? null,
      otherCharges: value.otherCharges ?? existingOrder.otherCharges ?? 0,
    };

    const updatedOrderDetails = await OrderDetailsFromSeller.findOneAndUpdate(
      { orderNumber },
      updatedData,
      { new: true }
    );

    // Fetch the sellerId and enquiryNumber from the updated order details
    const { sellerId, enquiryNumber } = updatedOrderDetails;

    // Find the corresponding QuoteProposal and SubmitQuote
    const existingQuoteProposal = await QuoteProposal.findOne({
      sellerId,
      enquiryNumber,
    });

    const existingSubmitQuote = await SubmitQuote.findOne({
      sellerId,
      enquiryNumber,
    });

    if (!existingQuoteProposal || !existingSubmitQuote) {
      return res.status(404).json({
        hasError: true,
        message:
          "No Quote Proposal or Submit Quote found for the given enquiryNumber and sellerId.",
      });
    }

    // Ensure all values are valid numbers
    const totalAmount = Number(existingQuoteProposal.totalAmount) || 0;
    const totalAmountForEdprowise =
      Number(existingQuoteProposal.totalAmountForEdprowise) || 0;
    const advanceRequiredAmount =
      Number(existingSubmitQuote.advanceRequiredAmount) || 0;
    const tdsValue = Number(existingQuoteProposal.tdsValue) || 0;
    const tdsValueForEdprowise =
      Number(existingQuoteProposal.tdsValueForEdprowise) || 0;
    const otherCharges = Number(updatedData.otherCharges) || 0;

    // Calculate the final payable amount with TDS
    const finalPayableAmountWithTDS =
      totalAmount - advanceRequiredAmount - tdsValue + otherCharges;

    const finalPayableAmountWithTDSForEdprowise =
      totalAmountForEdprowise -
      advanceRequiredAmount -
      tdsValueForEdprowise +
      otherCharges;

    // Update the QuoteProposal with the calculated values
    await QuoteProposal.findOneAndUpdate(
      { sellerId, enquiryNumber },
      { finalPayableAmountWithTDS, finalPayableAmountWithTDSForEdprowise },
      { new: true }
    );

    return res.status(200).json({
      message: "Order details updated successfully!",
      data: updatedOrderDetails,
      hasError: false,
    });
  } catch (error) {
    console.error("Error updating Order details:", error);
    return res.status(500).json({
      message: "Failed to update Order Details.",
      error: error.message,
    });
  }
}

export default updateByOrderNumber;
