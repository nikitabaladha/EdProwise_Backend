import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import OrderDetailsFromSellerValidator from "../../validators/OrderDetailsFromSeller.js";

async function updateByOrderNumber(req, res) {
  try {
    const { orderNumber } = req.query;

    if (!orderNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Order Number is required.",
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

    const existingOrder = await OrderDetailsFromSeller.findOne({ orderNumber });

    if (!existingOrder) {
      return res.status(404).json({
        hasError: true,
        message: "Order not found.",
      });
    }

    const updatedData = {
      actualDeliveryDate:
        value.actualDeliveryDate ?? existingOrder.actualDeliveryDate ?? null,
      otherCharges: value.otherCharges ?? existingOrder.otherCharges ?? 0,
      finalReceivableFromEdprowise:
        value.finalReceivableFromEdprowise ??
        existingOrder.finalReceivableFromEdprowise ??
        0,
    };

    const updatedOrderDetails = await OrderDetailsFromSeller.findOneAndUpdate(
      { orderNumber },
      updatedData,
      { new: true }
    );

    return res.status(200).json({
      message: "Order details updated successfully!",
      data: updatedOrderDetails,
      hasError: false,
    });
  } catch (error) {
    console.error("Error updating Order details:", error);
    return res.status(500).json({
      message: "Failed to update Order Details.",
      error: error.message,
    });
  }
}

export default updateByOrderNumber;
