import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";
import SellerProfile from "../../models/SellerProfile.js";

async function getAllBySchoolId(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      hasError: true,
      message: "School ID is required.",
    });
  }

  try {
    const orderDetails = await OrderDetailsFromSeller.find({ schoolId: id })
      .select(
        "orderNumber createdAt actualDeliveryDate otherCharges finalReceivableFromEdprowise enquiryNumber sellerId schoolId"
      )
      .lean();

    if (!orderDetails.length) {
      return res.status(404).json({
        hasError: true,
        message: "No order details found for the given School ID.",
      });
    }

    const enrichedOrders = await Promise.all(
      orderDetails.map(async (order) => {
        const { enquiryNumber, sellerId } = order;

        const quoteRequest = await QuoteRequest.findOne({ enquiryNumber })
          .select(
            "expectedDeliveryDate supplierStatus edprowiseStatus buyerStatus"
          )
          .lean();

        const quoteProposal = await QuoteProposal.findOne({ enquiryNumber })
          .select(
            "totalAmountBeforeGstAndDiscount totalAmount totalTaxableValue totalGstAmount quoteNumber finalPayableAmountWithoutTDS finalPayableAmountWithTDS tDSAmount"
          )
          .lean();

        const submitQuote = await SubmitQuote.findOne({ enquiryNumber })
          .select("advanceRequiredAmount")
          .lean();

        const sellerProfile = await SellerProfile.findOne({ sellerId })
          .select("companyName")
          .lean();

        return {
          ...order,
          expectedDeliveryDate: quoteRequest?.expectedDeliveryDate || null,
          supplierStatus: quoteRequest?.supplierStatus || null,
          buyerStatus: quoteRequest?.buyerStatus || null,
          edprowiseStatus: quoteRequest?.edprowiseStatus || null,
          totalAmountBeforeGstAndDiscount:
            quoteProposal?.totalAmountBeforeGstAndDiscount || null,
          totalAmount: quoteProposal?.totalAmount || null,
          totalTaxableValue: quoteProposal?.totalTaxableValue || null,
          totalGstAmount: quoteProposal?.totalGstAmount || null,
          finalPayableAmountWithoutTDS:
            quoteProposal?.finalPayableAmountWithoutTDS || 0,
          finalPayableAmountWithTDS:
            quoteProposal?.finalPayableAmountWithTDS || 0,
          tDSAmount: quoteProposal?.tDSAmount || 0,
          advanceAdjustment: submitQuote?.advanceRequiredAmount || null,
          companyName: sellerProfile?.companyName || "Not Available",
          quoteNumber: quoteProposal?.quoteNumber || null,
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

export default getAllBySchoolId;
