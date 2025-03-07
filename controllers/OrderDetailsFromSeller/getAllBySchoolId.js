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
      .sort({ createdAt: -1 })
      .select(
        "_id orderNumber quoteNumber createdAt actualDeliveryDate otherCharges finalReceivableFromEdprowise enquiryNumber sellerId schoolId"
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
        const { enquiryNumber, sellerId, quoteNumber } = order;

        const [quoteRequest, quoteProposals, submitQuote, sellerProfile] =
          await Promise.all([
            QuoteRequest.findOne({ enquiryNumber })
              .select("expectedDeliveryDate")
              .lean(),
            QuoteProposal.findOne({ enquiryNumber, quoteNumber, sellerId })
              .select(
                "totalAmountBeforeGstAndDiscount totalAmount totalTaxableValue totalGstAmount finalPayableAmountWithoutTDS finalPayableAmountWithTDS tDSAmount supplierStatus edprowiseStatus buyerStatus"
              )
              .lean(),
            SubmitQuote.findOne({ enquiryNumber, sellerId })
              .select("advanceRequiredAmount")
              .lean(),
            SellerProfile.findOne({ sellerId }).select("companyName").lean(),
          ]);

        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          enquiryNumber: order.enquiryNumber,
          quoteNumber: order.quoteNumber,
          sellerId: order.sellerId,
          schoolId: order.schoolId,
          actualDeliveryDate: order.actualDeliveryDate || null,
          otherCharges: order.otherCharges || 0,
          finalReceivableFromEdprowise: order.finalReceivableFromEdprowise || 0,
          createdAt: order.createdAt,
          expectedDeliveryDate: quoteRequest?.expectedDeliveryDate || null,
          supplierStatus: quoteProposals?.supplierStatus || null,
          buyerStatus: quoteProposals?.buyerStatus || null,
          edprowiseStatus: quoteProposals?.edprowiseStatus || null,
          totalAmountBeforeGstAndDiscount:
            quoteProposals?.totalAmountBeforeGstAndDiscount || 0,
          totalAmount: quoteProposals?.totalAmount || 0,
          totalTaxableValue: quoteProposals?.totalTaxableValue || 0,
          totalGstAmount: quoteProposals?.totalGstAmount || 0,
          finalPayableAmountWithoutTDS:
            quoteProposals?.finalPayableAmountWithoutTDS || 0,
          finalPayableAmountWithTDS:
            quoteProposals?.finalPayableAmountWithTDS || 0,
          tDSAmount: quoteProposals?.tDSAmount || 0,
          advanceAdjustment: submitQuote?.advanceRequiredAmount || 0,
          companyName: sellerProfile?.companyName || "Not Available",
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
