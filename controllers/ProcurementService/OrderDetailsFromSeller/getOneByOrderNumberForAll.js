import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import SellerProfile from "../../../models/SellerProfile.js";
import PrepareQuote from "../../../models/ProcurementService/PrepareQuote.js";

async function getOneByOrderNumber(req, res) {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    return res.status(400).json({
      hasError: true,
      message: "OrderNumber is required.",
    });
  }

  try {
    // First find the order details by orderNumber
    const orderDetails = await OrderDetailsFromSeller.findOne({ orderNumber })
      .select(
        "orderNumber createdAt actualDeliveryDate enquiryNumber sellerId schoolId invoiceForSchool invoiceForEdprowise"
      )
      .lean();

    if (!orderDetails) {
      return res.status(404).json({
        hasError: true,
        message: "No order details found for the given order number.",
      });
    }

    // Get seller profile using the sellerId from the order details
    const sellerProfile = await SellerProfile.findOne({
      sellerId: orderDetails.sellerId,
    })
      .select("companyName")
      .lean();

    const companyName = sellerProfile ? sellerProfile.companyName : null;
    const { enquiryNumber, sellerId } = orderDetails;

    // Fetch all related data in parallel for better performance
    const [quoteRequest, quoteProposal, prepareQuote, submitQuote] =
      await Promise.all([
        QuoteRequest.findOne({ enquiryNumber })
          .select("expectedDeliveryDate")
          .lean(),
        QuoteProposal.findOne({ sellerId, enquiryNumber })
          .select(
            "totalAmountBeforeGstAndDiscount totalAmount orderStatus totalTaxableValue " +
              "totalTaxAmount finalPayableAmountWithTDS tDSAmount tdsValue supplierStatus " +
              "edprowiseStatus buyerStatus totalTaxableValueForEdprowise " +
              "totalAmountForEdprowise totalTaxAmountForEdprowise tdsValueForEdprowise " +
              "finalPayableAmountWithTDSForEdprowise rating feedbackComment "
          )
          .lean(),
        PrepareQuote.findOne({ sellerId, enquiryNumber })
          .select(
            "cgstRate sgstRate igstRate cgstRateForEdprowise sgstRateForEdprowise igstRateForEdprowise"
          )
          .lean(),
        SubmitQuote.findOne({ enquiryNumber, sellerId })
          .select("advanceRequiredAmount deliveryCharges")
          .lean(),
      ]);

    // Construct the enriched order object
    const enrichedOrder = {
      ...orderDetails,
      companyName,
      expectedDeliveryDate: quoteRequest?.expectedDeliveryDate || null,
      supplierStatus: quoteProposal?.supplierStatus || null,
      buyerStatus: quoteProposal?.buyerStatus || null,
      orderStatus: quoteProposal?.orderStatus || null,
      edprowiseStatus: quoteProposal?.edprowiseStatus || null,
      totalAmountBeforeGstAndDiscount:
        quoteProposal?.totalAmountBeforeGstAndDiscount || null,
      totalAmount: quoteProposal?.totalAmount || null,
      totalAmountForEdprowise: quoteProposal?.totalAmountForEdprowise || 0,
      totalTaxableValue: quoteProposal?.totalTaxableValue || null,
      totalGstAmount: quoteProposal?.totalTaxAmount || null,
      feedbackComment: quoteProposal?.feedbackComment || null,
      rating: quoteProposal?.rating || 0,
      totalGstAmountForEdprowise:
        quoteProposal?.totalTaxAmountForEdprowise || 0,
      totalTaxableValueForEdprowise:
        quoteProposal?.totalTaxableValueForEdprowise || 0,
      advanceAdjustment: submitQuote?.advanceRequiredAmount || 0,
      deliveryCharges: submitQuote?.deliveryCharges || 0,
      tdsValue: quoteProposal?.tdsValue || 0,
      tdsValueForEdprowise: quoteProposal?.tdsValueForEdprowise || 0,
      finalPayableAmountWithTDS: quoteProposal?.finalPayableAmountWithTDS || 0,
      finalPayableAmountWithTDSForEdprowise:
        quoteProposal?.finalPayableAmountWithTDSForEdprowise || 0,
      tDSAmount: quoteProposal?.tDSAmount || 0,
      cgstRate: prepareQuote?.cgstRate || 0,
      sgstRate: prepareQuote?.sgstRate || 0,
      igstRate: prepareQuote?.igstRate || 0,
      cgstRateForEdprowise: prepareQuote?.cgstRateForEdprowise || 0,
      sgstRateForEdprowise: prepareQuote?.sgstRateForEdprowise || 0,
      igstRateForEdprowise: prepareQuote?.igstRateForEdprowise || 0,
    };

    return res.status(200).json({
      message: "Order details retrieved successfully!",
      data: enrichedOrder,
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

export default getOneByOrderNumber;
