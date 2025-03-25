// import QuoteProposal from "../../models/QuoteProposal.js";

// async function updateOrderStatus(req, res) {
//   try {
//     const { enquiryNumber, sellerId } = req.query;
//     const { orderStatus } = req.body;

//     if (!enquiryNumber || !sellerId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "enquiryNumber and sellerId are required.",
//       });
//     }

//     const allowedStatuses = ["Open", "Close"];

//     console.log("Received enquiryNumber:", enquiryNumber);
//     console.log("Received sellerId:", sellerId);
//     console.log("Received orderStatus:", orderStatus);

//     if (!allowedStatuses.includes(orderStatus)) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Invalid orderStatus. Allowed values: ${allowedStatuses.join(
//           ", "
//         )}`,
//       });
//     }

//     const existingQuote = await QuoteProposal.findOne({
//       enquiryNumber,
//       sellerId,
//     });

//     if (!existingQuote) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Quote not found for the given enquiryNumber and sellerId.",
//       });
//     }

//     console.log("Existing Quote before update:", existingQuote);

//     existingQuote.orderStatus = orderStatus;
//     await existingQuote.save();

//     return res.status(200).json({
//       hasError: false,
//       message: "Quote status updated successfully.",
//       data: existingQuote,
//     });
//   } catch (error) {
//     console.error("Error updating quote status:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal server error.",
//     });
//   }
// }

// export default updateOrderStatus;

import QuoteProposal from "../../models/QuoteProposal.js";

async function updateOrderStatus(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;
    const { orderStatus } = req.body;

    console.log("Received enquiryNumber:", enquiryNumber);
    console.log("Received sellerId:", sellerId);
    console.log("Received orderStatus:", orderStatus);

    if (!enquiryNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    const allowedStatuses = ["Open", "Close"];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid orderStatus. Allowed values: ${allowedStatuses.join(
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
        message: "Quote not found for the given enquiryNumber and sellerId.",
      });
    }

    console.log("Existing Quote before update:", existingQuote);

    // Update the orderStatus
    existingQuote.orderStatus = orderStatus;

    // Save the updated QuoteProposal
    const updatedQuote = await existingQuote.save();

    console.log("Updated Quote:", updatedQuote);

    return res.status(200).json({
      hasError: false,
      message: "Quote status updated successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error updating quote status:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateOrderStatus;
