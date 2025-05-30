import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";

import AdminUser from "../../../models/AdminUser.js";
import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import School from "../../../models/School.js";
import Seller from "../../../models/SellerProfile.js";
import { NotificationService } from "../../../notificationService.js";

async function requestForOrderCancelBySeller(req, res) {
  try {
    const { enquiryNumber, sellerId, schoolId } = req.query;
    const { cancelReasonFromSeller } = req.body;

    if (!enquiryNumber || !sellerId || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber, sellerId and schoolId are required.",
      });
    }

    if (!cancelReasonFromSeller || cancelReasonFromSeller.trim() === "") {
      return res.status(400).json({
        hasError: true,
        message: "Comment is required if you want to request for order cancel.",
      });
    }

    const updatedQuote = await QuoteProposal.findOneAndUpdate(
      { enquiryNumber, sellerId },
      {
        cancelReasonFromSeller,
        supplierStatus: "Requested For Cancel",
      },
      { new: true }
    );

    if (!updatedQuote) {
      return res.status(404).json({
        hasError: true,
        message: "Quote not found for the given enquiryNumber and sellerId.",
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

    const schoolProfile = await School.findOne({
      schoolId,
    });

    if (!schoolProfile) {
      return res.status(404).json({
        hasError: true,
        message: `School not found for given school ID ${schoolId}.`,
      });
    }

    const sellerProfile = await Seller.findOne({
      sellerId,
    });

    if (!sellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: `Seller not found for given seller ID ${sellerId}.`,
      });
    }

    const senderId = req.user.id;

    const relevantEdprowise = await AdminUser.find({});

    await NotificationService.sendNotification(
      "SELLER_REQUESTED_FOR_ORDER_CANCEL_FOR_EDPROWISE",
      relevantEdprowise.map((admin) => ({
        id: admin._id.toString(),
        type: "edprowise",
      })),
      {
        companyName: sellerProfile.companyName,
        schoolName: schoolProfile.schoolName,
        orderNumber: existingOrderDetailsFromSeller.orderNumber,
        enquiryNumber: existingOrderDetailsFromSeller.enquiryNumber,
        entityId: existingOrderDetailsFromSeller._id,
        entityType: "Order Cancel",
        senderType: "seller",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "order_cancel_request_by_seller",
        },
      }
    );

    await NotificationService.sendNotification(
      "SELLER_REQUESTED_FOR_ORDER_CANCEL_FOR_SCHOOL",
      [
        {
          id: schoolId.toString(),
          type: "school",
        },
      ],
      {
        companyName: sellerProfile.companyName,
        schoolName: schoolProfile.schoolName,
        orderNumber: existingOrderDetailsFromSeller.orderNumber,
        enquiryNumber: existingOrderDetailsFromSeller.enquiryNumber,
        entityId: existingOrderDetailsFromSeller._id,
        entityType: "Order Cancel",
        senderType: "seller",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "order_cancel_request_by_seller",
        },
      }
    );

    await NotificationService.sendNotification(
      "SELLER_REQUESTED_FOR_ORDER_CANCEL_FOR_SELLER",
      [
        {
          id: sellerId.toString(),
          type: "seller",
        },
      ],
      {
        companyName: sellerProfile.companyName,
        schoolName: schoolProfile.schoolName,
        orderNumber: existingOrderDetailsFromSeller.orderNumber,
        enquiryNumber: existingOrderDetailsFromSeller.enquiryNumber,
        entityId: existingOrderDetailsFromSeller._id,
        entityType: "Order Cancel",
        senderType: "seller",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "order_cancel_request_by_seller",
        },
      }
    );

    return res.status(200).json({
      hasError: false,
      message: "Order cancel requested successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error cancelling order request:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default requestForOrderCancelBySeller;
