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

    // Store the first product for each unique enquiryNumber
    const enquiryProductMap = new Map();

    for (const product of products) {
      if (!enquiryProductMap.has(product.enquiryNumber)) {
        enquiryProductMap.set(product.enquiryNumber, {
          id: product._id,
          schoolId: product.schoolId,
          categoryId: product.categoryId?._id || null,
          categoryName: product.categoryId?.categoryName || null,
          subCategoryId: product.subCategoryId?._id || null,
          subCategoryName: product.subCategoryId?.subCategoryName || null,
          description: product.description,
          productImage: product.productImage,
          unit: product.unit,
          quantity: product.quantity,
          enquiryNumber: product.enquiryNumber,
          // Attach quote request details
          quoteRequestId: quoteRequestsMap[product.enquiryNumber]?.id || null,
          deliveryAddress:
            quoteRequestsMap[product.enquiryNumber]?.deliveryAddress || null,
          deliveryLocation:
            quoteRequestsMap[product.enquiryNumber]?.deliveryLocation || null,
          deliveryLandMark:
            quoteRequestsMap[product.enquiryNumber]?.deliveryLandMark || null,
          deliveryPincode:
            quoteRequestsMap[product.enquiryNumber]?.deliveryPincode || null,
          expectedDeliveryDate:
            quoteRequestsMap[product.enquiryNumber]?.expectedDeliveryDate ||
            null,
          buyerStatus:
            quoteRequestsMap[product.enquiryNumber]?.buyerStatus || null,
          supplierStatus:
            quoteRequestsMap[product.enquiryNumber]?.supplierStatus || null,
          edprowiseStatus:
            quoteRequestsMap[product.enquiryNumber]?.edprowiseStatus || null,
          createdAt: quoteRequestsMap[product.enquiryNumber]?.createdAt || null,
          updatedAt: quoteRequestsMap[product.enquiryNumber]?.updatedAt || null,
        });
      }
    }

    // Convert map values to an array (first product of each enquiry number)
    const formattedProducts = Array.from(enquiryProductMap.values());

    return res.status(200).json({
      hasError: false,
      message: "Data fetched successfully.",
      data: formattedProducts,
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
