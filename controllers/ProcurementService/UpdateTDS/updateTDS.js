import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import AdminUser from "../../../models/AdminUser.js";

import { NotificationService } from "../../../notificationService.js";

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
        message:
          "No Submit Quote found for the given enquiryNumber and sellerId.",
      });
    }

    const existingOrderDetailsFromSeller = await OrderDetailsFromSeller.findOne(
      {
        sellerId,
        enquiryNumber,
      }
    );

    if (!existingOrderDetailsFromSeller) {
      return res.status(404).json({
        hasError: true,
        message: `No Order details found for enquiry number ${enquiryNumber} and seller ID ${sellerId}.`,
      });
    }

    const tdsValue =
      existingQuoteProposal.totalTaxableValue * (tDSAmount / 100);

    const tdsValueForEdprowise =
      existingQuoteProposal.totalTaxableValueForEdprowise * (tDSAmount / 100);

    const finalPayableAmountWithTDS =
      existingQuoteProposal.totalAmount -
      existingSubmitQuote.advanceRequiredAmount -
      tdsValue;

    const finalPayableAmountWithTDSForEdprowise =
      existingQuoteProposal.totalAmountForEdprowise -
      existingSubmitQuote.advanceRequiredAmount -
      tdsValueForEdprowise;

    existingQuoteProposal.tDSAmount = tDSAmount;
    existingQuoteProposal.tdsValue = tdsValue;
    existingQuoteProposal.tdsValueForEdprowise = tdsValueForEdprowise;
    existingQuoteProposal.finalPayableAmountWithTDS = finalPayableAmountWithTDS;
    existingQuoteProposal.finalPayableAmountWithTDSForEdprowise =
      finalPayableAmountWithTDSForEdprowise;

    // Save the updated QuoteProposal
    await existingQuoteProposal.save();

    const senderId = req.user.id;

    const relevantEdprowise = await AdminUser.find({});

    await NotificationService.sendNotification(
      "EDPROWISE_TDS_UPDATED",
      relevantEdprowise.map((admin) => ({
        id: admin._id.toString(),
        type: "edprowise",
      })),
      {
        orderNumber: existingOrderDetailsFromSeller.orderNumber,
        enquiryNumber: existingOrderDetailsFromSeller.enquiryNumber,
        entityId: existingQuoteProposal._id,
        entityType: "TDS Update",
        senderType: "edprowise",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "tds_updated_by_edprowise",
        },
      }
    );

    await NotificationService.sendNotification(
      "SCHOOL_TDS_UPDATED",
      [
        {
          id: existingOrderDetailsFromSeller.schoolId.toString(),
          type: "school",
        },
      ],
      {
        orderNumber: existingOrderDetailsFromSeller.orderNumber,
        enquiryNumber: existingOrderDetailsFromSeller.enquiryNumber,
        entityId: existingQuoteProposal._id,
        entityType: "TDS Update",
        senderType: "edprowise",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "tds_updated_by_edprowise",
        },
      }
    );

    await NotificationService.sendNotification(
      "SELLER_TDS_UPDATED",
      [
        {
          id: existingOrderDetailsFromSeller.sellerId.toString(),
          type: "seller",
        },
      ],
      {
        orderNumber: existingOrderDetailsFromSeller.orderNumber,
        enquiryNumber: existingOrderDetailsFromSeller.enquiryNumber,
        entityId: existingQuoteProposal._id,
        entityType: "TDS Update",
        senderType: "edprowise",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "tds_updated_by_edprowise",
        },
      }
    );

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
