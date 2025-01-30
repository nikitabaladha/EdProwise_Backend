import QuoteRequest from "../../models/AdminUser/QuoteRequest.js";
import Product from "../../models/AdminUser/Product.js";

async function getFirstProductForAdmin(req, res) {
  try {
    const quoteRequests = await QuoteRequest.find();

    const responseData = await Promise.all(
      quoteRequests.map(async (quote) => {
        const product = await Product.findOne({
          enquiryNumber: quote.enquiryNumber,
        })
          .populate("categoryId", "categoryName")
          .populate("subCategoryId", "subCategoryName")
          .exec();

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

          categoryId: product?.categoryId?._id || null,
          categoryName: product?.categoryId?.categoryName || null,
          subCategoryId: product?.subCategoryId?._id || null,
          subCategoryName: product?.subCategoryId?.subCategoryName || null,
          description: product?.description || null,
          productImage: product?.productImage || null,
          unit: product?.unit || null,
          quantity: product?.quantity || null,
          productEnquiryNumber: product?.enquiryNumber || null,
          productCreatedAt: product?.createdAt || null,
          productUpdatedAt: product?.updatedAt || null,
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

export default getFirstProductForAdmin;
