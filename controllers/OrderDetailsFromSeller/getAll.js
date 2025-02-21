// import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
// import QuoteRequest from "../../models/QuoteRequest.js";
// import QuoteProposal from "../../models/QuoteProposal.js";
// import SubmitQuote from "../../models/SubmitQuote.js";

// async function getAll(req, res) {
//   try {
//     // Fetch all orders
//     const orders = await OrderDetailsFromSeller.find()
//       .select(
//         "orderNumber createdAt actualDateOfDelivery otherCharges finalReceivableFromEdprowise enquiryNumber sellerId schoolId"
//       )
//       .lean();

//     if (!orders.length) {
//       return res.status(404).json({
//         hasError: true,
//         message: "No order details found.",
//       });
//     }

//     // Fetch all related data in one go
//     const enquiryNumbers = orders.map((order) => order.enquiryNumber);

//     const quoteRequests = await QuoteRequest.find({
//       enquiryNumber: { $in: enquiryNumbers },
//     })
//       .select(
//         "enquiryNumber expectedDeliveryDate supplierStatus edprowiseStatus buyerStatus"
//       )
//       .lean();

//     const quoteProposals = await QuoteProposal.find({
//       enquiryNumber: { $in: enquiryNumbers },
//     })
//       .select(
//         "enquiryNumber totalAmountBeforeGstAndDiscount totalAmount totalTaxableValue totalGstAmount"
//       )
//       .lean();

//     const submitQuotes = await SubmitQuote.find({
//       enquiryNumber: { $in: enquiryNumbers },
//     })
//       .select("enquiryNumber advanceRequiredAmount")
//       .lean();

//     // Convert fetched data into a map for quick lookup
//     const quoteRequestMap = Object.fromEntries(
//       quoteRequests.map((q) => [q.enquiryNumber, q])
//     );
//     const quoteProposalMap = Object.fromEntries(
//       quoteProposals.map((qp) => [qp.enquiryNumber, qp])
//     );
//     const submitQuoteMap = Object.fromEntries(
//       submitQuotes.map((sq) => [sq.enquiryNumber, sq])
//     );

//     // Enrich each order with additional details
//     const enrichedOrders = orders.map((order) => ({
//       ...order,
//       expectedDeliveryDate:
//         quoteRequestMap[order.enquiryNumber]?.expectedDeliveryDate || null,
//       supplierStatus:
//         quoteRequestMap[order.enquiryNumber]?.supplierStatus || null,
//       buyerStatus: quoteRequestMap[order.enquiryNumber]?.buyerStatus || null,
//       edprowiseStatus:
//         quoteRequestMap[order.enquiryNumber]?.edprowiseStatus || null,
//       totalAmountBeforeGstAndDiscount:
//         quoteProposalMap[order.enquiryNumber]
//           ?.totalAmountBeforeGstAndDiscount || null,
//       totalAmount: quoteProposalMap[order.enquiryNumber]?.totalAmount || null,
//       totalTaxableValue:
//         quoteProposalMap[order.enquiryNumber]?.totalTaxableValue || null,
//       totalGstAmount:
//         quoteProposalMap[order.enquiryNumber]?.totalGstAmount || null,
//       advanceAdjustment:
//         submitQuoteMap[order.enquiryNumber]?.advanceRequiredAmount || null,
//     }));

//     return res.status(200).json({
//       message: "All order details retrieved successfully!",
//       data: enrichedOrders,
//       hasError: false,
//     });
//   } catch (error) {
//     console.error("Error retrieving Order details:", error);
//     return res.status(500).json({
//       message: "Failed to retrieve Order Details.",
//       error: error.message,
//     });
//   }
// }

// export default getAll;

import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";
import SellerProfile from "../../models/SellerProfile.js";

async function getAll(req, res) {
  try {
    // Fetch all orders
    const orders = await OrderDetailsFromSeller.find()
      .select(
        "orderNumber createdAt actualDateOfDelivery otherCharges finalReceivableFromEdprowise enquiryNumber sellerId schoolId"
      )
      .lean();

    if (!orders.length) {
      return res.status(404).json({
        hasError: true,
        message: "No order details found.",
      });
    }

    // Extract unique sellerIds
    const sellerIds = [...new Set(orders.map((order) => order.sellerId))];

    // Fetch seller profiles
    const sellerProfiles = await SellerProfile.find({
      sellerId: { $in: sellerIds },
    })
      .select("sellerId companyName")
      .lean();

    // Create a seller map for quick lookup
    const sellerMap = Object.fromEntries(
      sellerProfiles.map((seller) => [
        seller.sellerId.toString(),
        seller.companyName,
      ])
    );

    // Fetch all related data in one go
    const enquiryNumbers = orders.map((order) => order.enquiryNumber);

    const quoteRequests = await QuoteRequest.find({
      enquiryNumber: { $in: enquiryNumbers },
    })
      .select(
        "enquiryNumber expectedDeliveryDate supplierStatus edprowiseStatus buyerStatus"
      )
      .lean();

    const quoteProposals = await QuoteProposal.find({
      enquiryNumber: { $in: enquiryNumbers },
    })
      .select(
        "enquiryNumber totalAmountBeforeGstAndDiscount totalAmount totalTaxableValue totalGstAmount finalPayableAmountWithoutTDS finalPayableAmountWithTDS tDSAmount"
      )
      .lean();

    const submitQuotes = await SubmitQuote.find({
      enquiryNumber: { $in: enquiryNumbers },
    })
      .select("enquiryNumber advanceRequiredAmount")
      .lean();

    // Convert fetched data into a map for quick lookup
    const quoteRequestMap = Object.fromEntries(
      quoteRequests.map((q) => [q.enquiryNumber, q])
    );
    const quoteProposalMap = Object.fromEntries(
      quoteProposals.map((qp) => [qp.enquiryNumber, qp])
    );
    const submitQuoteMap = Object.fromEntries(
      submitQuotes.map((sq) => [sq.enquiryNumber, sq])
    );

    // Enrich each order with additional details, including companyName
    const enrichedOrders = orders.map((order) => ({
      ...order,
      companyName: sellerMap[order.sellerId?.toString()] || null,
      expectedDeliveryDate:
        quoteRequestMap[order.enquiryNumber]?.expectedDeliveryDate || null,
      supplierStatus:
        quoteRequestMap[order.enquiryNumber]?.supplierStatus || null,
      buyerStatus: quoteRequestMap[order.enquiryNumber]?.buyerStatus || null,
      edprowiseStatus:
        quoteRequestMap[order.enquiryNumber]?.edprowiseStatus || null,
      totalAmountBeforeGstAndDiscount:
        quoteProposalMap[order.enquiryNumber]
          ?.totalAmountBeforeGstAndDiscount || null,
      totalAmount: quoteProposalMap[order.enquiryNumber]?.totalAmount || null,
      totalTaxableValue:
        quoteProposalMap[order.enquiryNumber]?.totalTaxableValue || null,
      totalGstAmount:
        quoteProposalMap[order.enquiryNumber]?.totalGstAmount || null,
      advanceAdjustment:
        submitQuoteMap[order.enquiryNumber]?.advanceRequiredAmount || null,
      finalPayableAmountWithoutTDS:
        quoteProposalMap[order.enquiryNumber]?.finalPayableAmountWithoutTDS ||
        null,
      finalPayableAmountWithTDS:
        quoteProposalMap[order.enquiryNumber]?.finalPayableAmountWithTDS ||
        null,
      tDSAmount: quoteProposalMap[order.enquiryNumber]?.tDSAmount,
    }));

    return res.status(200).json({
      message: "All order details retrieved successfully!",
      data: enrichedOrders,
      hasError: false,
    });
  } catch (error) {
    console.error("Error retrieving Order details:", error);
    return res.status(500).json({
      message: "Failed to retrieve Order Details.",
      error: error.message,
    });
  }
}

export default getAll;
