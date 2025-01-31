import QuoteRequest from "../../models/QuoteRequest.js";
import Product from "../../models/Product.js";

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
        })
          .populate("categoryId", "categoryName")
          .populate("subCategoryId", "subCategoryName")
          .exec();

        // Get only the first product if available
        const firstProduct = products.length > 0 ? products[0] : null;

        return {
          id: quote._id,
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
          // product fields
          categoryId: firstProduct ? firstProduct.categoryId._id : null,
          categoryName: firstProduct
            ? firstProduct.categoryId.categoryName
            : null,
          subCategoryId: firstProduct ? firstProduct.subCategoryId._id : null,
          subCategoryName: firstProduct
            ? firstProduct.subCategoryId.subCategoryName
            : null,
          description: firstProduct ? firstProduct.description : null,
          productImage: firstProduct ? firstProduct.productImage : null,
          unit: firstProduct ? firstProduct.unit : null,
          quantity: firstProduct ? firstProduct.quantity : null,
          productEnquiryNumber: firstProduct
            ? firstProduct.enquiryNumber
            : null,
          productCreatedAt: firstProduct ? firstProduct.createdAt : null,
          productUpdatedAt: firstProduct ? firstProduct.updatedAt : null,
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
