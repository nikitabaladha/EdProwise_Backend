import QuoteRequest from "../../models/AdminUser/QuoteRequest.js";
import Product from "../../models/AdminUser/Product.js";
import SellerProfile from "../../models/AdminUser/SellerProfile.js";

async function getProductsForSeller(req, res) {
  try {
    const sellerId = req.user?.id;

    // Fetch the seller's profile to get the dealing products
    const sellerProfile = await SellerProfile.findOne({ sellerId })
      .populate("dealingProducts.categoryId")
      .populate("dealingProducts.subCategoryIds");

    if (!sellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found.",
      });
    }

    // Extract the dealing products
    const dealingProducts = sellerProfile.dealingProducts;

    // Create arrays for categoryIds and subCategoryIds
    const categoryIds = dealingProducts.map((product) => product.categoryId);
    const subCategoryIds = dealingProducts.flatMap(
      (product) => product.subCategoryIds
    );

    // Find all products that match the seller's dealing products
    const products = await Product.find({
      $or: [
        { categoryId: { $in: categoryIds } },
        { subCategoryId: { $in: subCategoryIds } },
      ],
    })
      .populate("categoryId", "categoryName")
      .populate("subCategoryId", "subCategoryName");

    // Check if there are any products and get only the first product
    const firstProduct = products.length > 0 ? products[0] : null;

    // Fetch quote requests associated with the seller
    const quoteRequests = await QuoteRequest.find();

    // Create a map of quote requests by enquiry number
    const quoteRequestsMap = quoteRequests.reduce((acc, quoteRequest) => {
      acc[quoteRequest.enquiryNumber] = {
        id: quoteRequest._id,
        deliveryAddress: quoteRequest.deliveryAddress,
        deliveryLocation: quoteRequest.deliveryLocation,
        deliveryLandMark: quoteRequest.deliveryLandMark,
        deliveryPincode: quoteRequest.deliveryPincode,
        expectedDeliveryDate: quoteRequest.expectedDeliveryDate,
        buyerStatus: quoteRequest.buyerStatus,
        supplierStatus: quoteRequest.supplierStatus,
        edprowiseStatus: quoteRequest.edprowiseStatus,
        createdAt: quoteRequest.createdAt,
        updatedAt: quoteRequest.updatedAt,
        enquiryNumber: quoteRequest.enquiryNumber,
      };
      return acc;
    }, {});

    // Format the first product only
    const formattedProduct = firstProduct
      ? {
          id: firstProduct._id,
          schoolId: firstProduct.schoolId,
          categoryId: firstProduct.categoryId?._id || null,
          categoryName: firstProduct.categoryId?.categoryName || null,
          subCategoryId: firstProduct.subCategoryId?._id || null,
          subCategoryName: firstProduct.subCategoryId?.subCategoryName || null,
          description: firstProduct.description,
          productImage: firstProduct.productImage,
          unit: firstProduct.unit,
          quantity: firstProduct.quantity,
          enquiryNumber: firstProduct.enquiryNumber,
          // Extract quote request details directly into the product object
          quoteRequestId:
            quoteRequestsMap[firstProduct.enquiryNumber]?.id || null,
          deliveryAddress:
            quoteRequestsMap[firstProduct.enquiryNumber]?.deliveryAddress ||
            null,
          deliveryLocation:
            quoteRequestsMap[firstProduct.enquiryNumber]?.deliveryLocation ||
            null,
          deliveryLandMark:
            quoteRequestsMap[firstProduct.enquiryNumber]?.deliveryLandMark ||
            null,
          deliveryPincode:
            quoteRequestsMap[firstProduct.enquiryNumber]?.deliveryPincode ||
            null,
          expectedDeliveryDate:
            quoteRequestsMap[firstProduct.enquiryNumber]
              ?.expectedDeliveryDate || null,
          buyerStatus:
            quoteRequestsMap[firstProduct.enquiryNumber]?.buyerStatus || null,
          supplierStatus:
            quoteRequestsMap[firstProduct.enquiryNumber]?.supplierStatus ||
            null,
          edprowiseStatus:
            quoteRequestsMap[firstProduct.enquiryNumber]?.edprowiseStatus ||
            null,
          createdAt:
            quoteRequestsMap[firstProduct.enquiryNumber]?.createdAt || null,
          updatedAt:
            quoteRequestsMap[firstProduct.enquiryNumber]?.updatedAt || null,
        }
      : null;

    return res.status(200).json({
      hasError: false,
      message: "Data fetched successfully.",
      data: [formattedProduct],
    });
  } catch (error) {
    console.error("Error fetching products for seller:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch data.",
      error: error.message,
    });
  }
}

export default getProductsForSeller;
