import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteProposal from "../../models/QuoteProposal.js";

async function updateStatus(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;

    const { supplierStatus } = req.body;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber is required",
      });
    }
    if (!sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "SellerId is required",
      });
    }

    const allowedStatuses = [
      "Work In Progress",
      "Ready For Transit",
      "In-Transit",
      "Delivered",
    ];

    if (!allowedStatuses.includes(supplierStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid Supplier Status. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const existingOder = await QuoteProposal.findOne({
      sellerId,
      enquiryNumber,
    });

    if (!existingOder) {
      return res.status(404).json({
        hasError: true,
        message: "Order not found for the given enquiryNumber",
      });
    }

    existingOder.supplierStatus = supplierStatus;
    existingOder.edprowiseStatus = supplierStatus;
    existingOder.buyerStatus = supplierStatus;
    await existingOder.save();

    if (supplierStatus === "Ready For Transit") {
      const orderDetails = await OrderDetailsFromSeller.findOne({
        enquiryNumber,
        sellerId,
      });

      if (orderDetails) {
        orderDetails.invoiceDate = new Date();
        await orderDetails.save();
      }
    }

    return res.status(200).json({
      hasError: false,
      message: "Order status updated successfully.",
      data: existingOder,
    });
  } catch (error) {
    console.error("Error updating Order Status:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateStatus;
