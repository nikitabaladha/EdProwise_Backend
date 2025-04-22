import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";

async function getByOrderNumber(req, res) {
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

    const existingOrder = await OrderDetailsFromSeller.findOne({
      orderNumber,
      sellerId,
    });

    if (!existingOrder) {
      return res.status(404).json({
        hasError: true,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      message: "Order details retrieved successfully!",
      data: existingOrder,
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

export default getByOrderNumber;
