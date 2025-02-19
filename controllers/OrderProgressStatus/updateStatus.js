import QuoteRequest from "../../models/QuoteRequest.js";

async function updateStatus(req, res) {
  try {
    const { enquiryNumber } = req.query;

    const { supplierStatus } = req.body;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber is required",
      });
    }

    const allowedStatuses = [
      "Work In Progress",
      "Ready For Transit",
      "Ready For In-Transit",
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

    const existingOder = await QuoteRequest.findOne({
      enquiryNumber,
    });

    if (!existingOder) {
      return res.status(404).json({
        hasError: true,
        message: "Order not found for the given enquiryNumber",
      });
    }

    existingOder.supplierStatus = supplierStatus;
    await existingOder.save();

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
