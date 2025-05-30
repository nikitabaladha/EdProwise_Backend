import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import OrderDetailsFromSellerValidator from "../../../validators/ProcurementService/OrderDetailsFromSeller.js";

import AdminUser from "../../../models/AdminUser.js";
import School from "../../../models/School.js";
import Seller from "../../../models/SellerProfile.js";
import { NotificationService } from "../../../notificationService.js";

async function updateByOrderNumber(req, res) {
  try {
    const { orderNumber } = req.query;

    if (!orderNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Order Number is required.",
      });
    }

    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "Seller Id is required.",
      });
    }

    const { error, value } =
      OrderDetailsFromSellerValidator.orderDetailsFromSellerUpdate.validate(
        req.body
      );

    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const existingOrder = await OrderDetailsFromSeller.findOne({
      sellerId,
      orderNumber,
    });

    if (!existingOrder) {
      return res.status(404).json({
        hasError: true,
        message: "Order not found.",
      });
    }

    const updatedData = {
      actualDeliveryDate:
        value.actualDeliveryDate ?? existingOrder.actualDeliveryDate ?? null,
    };

    const updatedOrderDetails = await OrderDetailsFromSeller.findOneAndUpdate(
      { sellerId, orderNumber },
      { $set: updatedData },
      { new: true }
    ).select("sellerId enquiryNumber actualDeliveryDate schoolId orderNumber");

    if (!updatedOrderDetails) {
      return res.status(500).json({
        hasError: true,
        message: "Failed to update order details.",
      });
    }
    const schoolId = updatedOrderDetails.schoolId;

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
      "SELLER_DELIVERY_DATE_CHANGED_FOR_EDPROWISE",
      relevantEdprowise.map((admin) => ({
        id: admin._id.toString(),
        type: "edprowise",
      })),
      {
        companyName: sellerProfile.companyName,
        schoolName: schoolProfile.schoolName,
        orderNumber: updatedOrderDetails.orderNumber,
        enquiryNumber: updatedOrderDetails.enquiryNumber,
        entityId: updatedOrderDetails._id,
        entityType: "Delivery Date Changed",
        senderType: "seller",
        senderId: senderId,
        metadata: {
          orderNumber: updatedOrderDetails.orderNumber,
          type: "delivery_date_changed_by_seller",
        },
      }
    );

    await NotificationService.sendNotification(
      "SELLER_DELIVERY_DATE_CHANGED_FOR_SCHOOL",
      [
        {
          id: schoolId.toString(),
          type: "school",
        },
      ],
      {
        companyName: sellerProfile.companyName,
        schoolName: schoolProfile.schoolName,
        orderNumber: updatedOrderDetails.orderNumber,
        enquiryNumber: updatedOrderDetails.enquiryNumber,
        entityId: updatedOrderDetails._id,
        entityType: "Delivery Date Changed",
        senderType: "seller",
        senderId: senderId,
        metadata: {
          orderNumber: updatedOrderDetails.orderNumber,
          type: "delivery_date_changed_by_seller",
        },
      }
    );

    await NotificationService.sendNotification(
      "SELLER_DELIVERY_DATE_CHANGED_FOR_SELLER",
      [
        {
          id: sellerId.toString(),
          type: "seller",
        },
      ],
      {
        companyName: sellerProfile.companyName,
        schoolName: schoolProfile.schoolName,
        orderNumber: updatedOrderDetails.orderNumber,
        enquiryNumber: updatedOrderDetails.enquiryNumber,
        entityId: updatedOrderDetails._id,
        entityType: "Delivery Date Changed",
        senderType: "seller",
        senderId: senderId,
        metadata: {
          orderNumber: updatedOrderDetails.orderNumber,
          type: "delivery_date_changed_by_seller",
        },
      }
    );

    return res.status(200).json({
      message: "Order details updated successfully!",
      data: updatedOrderDetails,
      hasError: false,
    });
  } catch (error) {
    console.error("Error updating Order details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Order Details.",
      error: error.message,
    });
  }
}

export default updateByOrderNumber;
