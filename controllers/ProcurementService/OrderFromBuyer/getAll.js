import OrderFromBuyer from "../../../models/ProcurementService/OrderFromBuyer.js";

async function getAll(req, res) {
  try {
    const { orderNumber, sellerId } = req.params;

    const orders = await OrderFromBuyer.find(
      { orderNumber, sellerId },
      "orderNumber cartImages subcategoryName listingRate quantity discount finalRate"
    );

    if (!orders.length) {
      return res.status(404).json({
        hasError: true,
        message: "No orders found for the given orderNumber and sellerId.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Orders fetched successfully.",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

export default getAll;
