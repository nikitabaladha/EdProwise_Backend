import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import SellerProfile from "../../../models/SellerProfile.js";
import PrepareQuote from "../../../models/ProcurementService/PrepareQuote.js";

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
        "orderNumber createdAt actualDeliveryDate enquiryNumber sellerId schoolId invoiceForSchool invoiceForEdprowise"
      )
      .sort({ createdAt: -1 })
      .lean();

    if (!orderDetails.length) {
      return res.status(404).json({
        hasError: true,
        message: "No order details found for the given seller ID.",
      });
    }

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
            "totalAmountBeforeGstAndDiscount totalAmount orderStatus totalTaxableValue totalTaxAmount finalPayableAmountWithTDS tDSAmount tdsValue supplierStatus edprowiseStatus buyerStatus totalTaxableValueForEdprowise totalAmountForEdprowise totalTaxAmountForEdprowise tdsValueForEdprowise finalPayableAmountWithTDSForEdprowise"
          )
          .lean();

        const prepareQuote = await PrepareQuote.findOne({
          sellerId: id,
          enquiryNumber,
        })
          .select(
            "cgstRate sgstRate igstRate cgstRateForEdprowise sgstRateForEdprowise igstRateForEdprowise"
          )
          .lean();

        const submitQuote = await SubmitQuote.findOne({ enquiryNumber })
          .select("advanceRequiredAmount deliveryCharges")
          .lean();

        return {
          ...order,
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
          totalGstAmountForEdprowise:
            quoteProposal?.totalTaxAmountForEdprowise || 0,
          totalTaxableValueForEdprowise:
            quoteProposal?.totalTaxableValueForEdprowise || 0,
          advanceAdjustment: submitQuote?.advanceRequiredAmount || 0,
          tdsValue: quoteProposal?.tdsValue || 0,
          tdsValueForEdprowise: quoteProposal?.tdsValueForEdprowise || 0,
          finalPayableAmountWithTDS:
            quoteProposal?.finalPayableAmountWithTDS || 0,
          finalPayableAmountWithTDSForEdprowise:
            quoteProposal?.finalPayableAmountWithTDSForEdprowise || 0,
          tDSAmount: quoteProposal?.tDSAmount || 0,
          cgstRate: prepareQuote.cgstRate || 0,
          sgstRate: prepareQuote.sgstRate || 0,
          igstRate: prepareQuote.igstRate || 0,
          cgstRateForEdprowise: prepareQuote.cgstRateForEdprowise || 0,
          sgstRateForEdprowise: prepareQuote.sgstRateForEdprowise || 0,
          igstRateForEdprowise: prepareQuote.igstRateForEdprowise || 0,
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
