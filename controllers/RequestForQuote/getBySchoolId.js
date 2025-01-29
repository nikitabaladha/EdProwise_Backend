import QuoteRequest from "../../models/AdminUser/QuoteRequest.js";
import Product from "../../models/AdminUser/Product.js";

async function getBySchoolId(req, res) {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message:
        "Access denied: You do not have permission to view quote requests.",
    });
  }

  try {
    const quoteRequests = await QuoteRequest.find({ schoolId }).exec();

    const responseData = await Promise.all(
      quoteRequests.map(async (quote) => {
        const products = await Product.find({
          enquiryNumber: quote.enquiryNumber,
        }).exec();
        return {
          _id: quote._id,
          schoolId: quote.schoolId,
          enquiryNumber: quote.enquiryNumber,
          deliveryAddress: quote.deliveryAddress,
          deliveryLocation: quote.deliveryLocation,
          deliveryLandMark: quote.deliveryLandMark,
          deliveryPincode: quote.deliveryPincode,
          expectedDeliveryDate: quote.expectedDeliveryDate,
          buyerStatus: quote.buyerStatus,
          supplierStatus: quote.supplierStatus,
          edprowiseStatus: quote.edprowiseStatus,
          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
          products: products,
        };
      })
    );

    return res.status(200).json({
      hasError: false,
      message: "Quote requests retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Error retrieving quote requests:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve quote requests.",
      error: error.message,
    });
  }
}

export default getBySchoolId;
