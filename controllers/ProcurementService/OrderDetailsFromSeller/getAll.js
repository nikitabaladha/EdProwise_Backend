import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import SellerProfile from "../../../models/SellerProfile.js";
import PrepareQuote from "../../../models/ProcurementService/PrepareQuote.js";

async function getAll(req, res) {
  try {
    // Fetch all orders with necessary fields
    const orders = await OrderDetailsFromSeller.find()
      .sort({ createdAt: -1 })
      .select(
        "orderNumber quoteNumber createdAt actualDeliveryDate otherCharges " +
          "enquiryNumber sellerId schoolId"
      )
      .lean();

    if (!orders.length) {
      return res.status(404).json({
        hasError: true,
        message: "No order details found.",
      });
    }

    // Get unique sellerIds and enquiryNumbers
    const sellerIds = [...new Set(orders.map((order) => order.sellerId))];
    const enquiryNumbers = [
      ...new Set(orders.map((order) => order.enquiryNumber)),
    ];

    // Fetch related data in parallel
    const [
      sellerProfiles,
      quoteRequests,
      quoteProposals,
      submitQuotes,
      prepareQuotes,
    ] = await Promise.all([
      SellerProfile.find({ sellerId: { $in: sellerIds } })
        .select("sellerId companyName")
        .lean(),
      QuoteRequest.find({ enquiryNumber: { $in: enquiryNumbers } })
        .select("enquiryNumber expectedDeliveryDate")
        .lean(),
      QuoteProposal.find({
        enquiryNumber: { $in: enquiryNumbers },
        sellerId: { $in: sellerIds },
      })
        .select(
          `enquiryNumber 
          sellerId 
          totalAmountBeforeGstAndDiscount 
          totalAmount 
          cancelReasonFromBuyer 
          cancelReasonFromSeller
          totalTaxableValue 
          totalTaxAmount
          tdsValue 
          finalPayableAmountWithTDS
          tDSAmount 
          supplierStatus 
          edprowiseStatus 
          buyerStatus 
          totalTaxableValueForEdprowise 
          totalAmountForEdprowise 
          totalTaxAmountForEdprowise 
          tdsValueForEdprowise 
          finalPayableAmountWithTDSForEdprowise
          orderStatus `
        )
        .lean(),
      SubmitQuote.find({
        enquiryNumber: { $in: enquiryNumbers },
        sellerId: { $in: sellerIds },
      })
        .select("enquiryNumber sellerId advanceRequiredAmount deliveryCharges")
        .lean(),
      PrepareQuote.find({
        enquiryNumber: { $in: enquiryNumbers },
        sellerId: { $in: sellerIds },
      })
        .select(
          "enquiryNumber sellerId cgstRate sgstRate igstRate cgstRateForEdprowise sgstRateForEdprowise igstRateForEdprowise "
        )
        .lean(),
    ]);

    // Create lookup maps
    const sellerMap = Object.fromEntries(
      sellerProfiles.map((seller) => [
        seller.sellerId.toString(),
        seller.companyName,
      ])
    );

    const quoteRequestMap = Object.fromEntries(
      quoteRequests.map((q) => [q.enquiryNumber, q])
    );

    // Create composite key maps for quoteProposals and submitQuotes
    const quoteProposalMap = Object.fromEntries(
      quoteProposals.map((qp) => [`${qp.enquiryNumber}_${qp.sellerId}`, qp])
    );

    const submitQuoteMap = Object.fromEntries(
      submitQuotes.map((sq) => [`${sq.enquiryNumber}_${sq.sellerId}`, sq])
    );

    const prepareQuoteMap = Object.fromEntries(
      prepareQuotes.map((pq) => [`${pq.enquiryNumber}_${pq.sellerId}`, pq])
    );

    // Enrich orders with related data
    const enrichedOrders = orders.map((order) => {
      const compositeKey = `${order.enquiryNumber}_${order.sellerId}`;
      const quoteProposal = quoteProposalMap[compositeKey] || {};
      const submitQuote = submitQuoteMap[compositeKey] || {};
      const prepareQuote = prepareQuoteMap[compositeKey] || {};

      return {
        ...order,
        companyName: sellerMap[order.sellerId?.toString()] || null,
        expectedDeliveryDate:
          quoteRequestMap[order.enquiryNumber]?.expectedDeliveryDate || null,
        supplierStatus: quoteProposal.supplierStatus || null,
        buyerStatus: quoteProposal.buyerStatus || null,
        orderStatus: quoteProposal.orderStatus || null,
        edprowiseStatus: quoteProposal.edprowiseStatus || null,
        totalAmountBeforeGstAndDiscount:
          quoteProposal.totalAmountBeforeGstAndDiscount || null,
        totalAmount: quoteProposal.totalAmount || null,
        totalAmountForEdprowise: quoteProposal.totalAmountForEdprowise || null,
        totalTaxableValue: quoteProposal.totalTaxableValue || null,
        totalTaxableValueForEdprowise:
          quoteProposal.totalTaxableValueForEdprowise || null,
        totalGstAmount: quoteProposal.totalTaxAmount || null,
        totalGstAmountForEdprowise:
          quoteProposal.totalTaxAmountForEdprowise || null,
        advanceAdjustment: submitQuote.advanceRequiredAmount || 0,
        deliveryCharges: submitQuote?.deliveryCharges || 0,

        finalPayableAmountWithTDS: quoteProposal.finalPayableAmountWithTDS || 0,
        finalPayableAmountWithTDSForEdprowise:
          quoteProposal.finalPayableAmountWithTDSForEdprowise || 0,
        tDSAmount: quoteProposal.tDSAmount || 0,
        tdsValue: quoteProposal.tdsValue || 0,
        tdsValueForEdprowise: quoteProposal.tdsValueForEdprowise || 0,
        cancelReasonFromBuyer: quoteProposal.cancelReasonFromBuyer || null,
        cancelReasonFromSeller: quoteProposal.cancelReasonFromSeller || null,
        cgstRate: prepareQuote.cgstRate || 0,
        sgstRate: prepareQuote.sgstRate || 0,
        igstRate: prepareQuote.igstRate || 0,
        cgstRateForEdprowise: prepareQuote.cgstRateForEdprowise || 0,
        sgstRateForEdprowise: prepareQuote.sgstRateForEdprowise || 0,
        igstRateForEdprowise: prepareQuote.igstRateForEdprowise || 0,
      };
    });

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
      hasError: true,
    });
  }
}

export default getAll;
