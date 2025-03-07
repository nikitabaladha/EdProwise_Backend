import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";
import SellerProfile from "../../models/SellerProfile.js";

async function getAllBySellerId(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      hasError: true,
      message: "Seller ID is required.",
    });
  }

  try {
    const orderDetails = await OrderDetailsFromSeller.find({ sellerId: id })
      .select(
        "orderNumber createdAt actualDeliveryDate otherCharges finalReceivableFromEdprowise enquiryNumber sellerId schoolId"
      )
      .sort({ createdAt: -1 })
      .lean();

    if (!orderDetails.length) {
      return res.status(404).json({
        hasError: true,
        message: "No order details found for the given seller ID.",
      });
    }

    // Fetch company name from SellerProfile
    const sellerProfile = await SellerProfile.findOne({ sellerId: id })
      .select("companyName")
      .lean();

    const companyName = sellerProfile ? sellerProfile.companyName : null;

    const enrichedOrders = await Promise.all(
      orderDetails.map(async (order) => {
        const { enquiryNumber } = order;

        const quoteRequest = await QuoteRequest.findOne({ enquiryNumber })
          .select("expectedDeliveryDate ")
          .lean();

        const quoteProposal = await QuoteProposal.findOne({
          sellerId: id,
          enquiryNumber,
        })
          .select(
            "totalAmountBeforeGstAndDiscount totalAmount totalTaxableValue totalGstAmount finalPayableAmountWithoutTDS finalPayableAmountWithTDS tDSAmount supplierStatus edprowiseStatus buyerStatus"
          )
          .lean();

        const submitQuote = await SubmitQuote.findOne({ enquiryNumber })
          .select("advanceRequiredAmount")
          .lean();

        return {
          ...order,
          companyName,
          expectedDeliveryDate: quoteRequest?.expectedDeliveryDate || null,
          supplierStatus: quoteProposal?.supplierStatus || null,
          buyerStatus: quoteProposal?.buyerStatus || null,
          edprowiseStatus: quoteProposal?.edprowiseStatus || null,
          totalAmountBeforeGstAndDiscount:
            quoteProposal?.totalAmountBeforeGstAndDiscount || null,
          totalAmount: quoteProposal?.totalAmount || null,
          totalTaxableValue: quoteProposal?.totalTaxableValue || null,
          totalGstAmount: quoteProposal?.totalGstAmount || null,
          advanceAdjustment: submitQuote?.advanceRequiredAmount || null,
          finalPayableAmountWithoutTDS:
            quoteProposal?.finalPayableAmountWithoutTDS || 0,
          finalPayableAmountWithTDS:
            quoteProposal?.finalPayableAmountWithTDS || 0,
          tDSAmount: quoteProposal?.tDSAmount || 0,
        };
      })
    );

    return res.status(200).json({
      message: "Order details retrieved successfully!",
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

export default getAllBySellerId;
