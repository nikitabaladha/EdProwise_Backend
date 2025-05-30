import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import AdminUser from "../../../models/AdminUser.js";
import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import School from "../../../models/School.js";
import Seller from "../../../models/SellerProfile.js";
import { NotificationService } from "../../../notificationService.js";

async function CancelOrderByEdprowise(req, res) {
  try {
    const { enquiryNumber, sellerId, schoolId } = req.query;
    const { edprowiseStatus } = req.body;

    if (!enquiryNumber || !sellerId || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber, sellerId and schoolId are required.",
      });
    }

    const allowedStatuses = ["Cancelled"];

    if (!allowedStatuses.includes(edprowiseStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid EdprowiseStatus. Allowed values: ${allowedStatuses.join(
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
        message:
          "Quote not found for the given enquiryNumber,sellerId and schoolId.",
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

    // Update the orderStatus
    existingQuote.buyerStatus = edprowiseStatus;
    existingQuote.supplierStatus = edprowiseStatus;
    existingQuote.edprowiseStatus = edprowiseStatus;

    // Save the updated QuoteProposal
    const updatedQuote = await existingQuote.save();

    const senderId = req.user.id;

    const relevantEdprowise = await AdminUser.find({});

    await NotificationService.sendNotification(
      "EDPROWISE_CANCELLED_ORDER",
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
        senderType: "edprowise",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "order_cancelled_by_edprowise",
        },
      }
    );

    await NotificationService.sendNotification(
      "EDPROWISE_CANCELLED_ORDER_FOR_SCHOOL",
      [
        {
          id: existingOrderDetailsFromSeller.schoolId.toString(),
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
        senderType: "edprowise",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "order_cancelled_by_edprowise",
        },
      }
    );

    await NotificationService.sendNotification(
      "EDPROWISE_CANCELLED_ORDER_FOR_SELLER",
      [
        {
          id: existingOrderDetailsFromSeller.sellerId.toString(),
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
        senderType: "edprowise",
        senderId: senderId,
        metadata: {
          orderNumber: existingOrderDetailsFromSeller.orderNumber,
          type: "order_cancelled_by_edprowise",
        },
      }
    );

    return res.status(200).json({
      hasError: false,
      message: "Order Cancelled by Edprowise successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error Cancelling Order by Edprowise.", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default CancelOrderByEdprowise;
