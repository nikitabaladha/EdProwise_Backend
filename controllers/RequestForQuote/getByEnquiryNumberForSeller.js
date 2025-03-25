import QuoteRequest from "../../models/QuoteRequest.js";
import Product from "../../models/Product.js";
import SellerProfile from "../../models/SellerProfile.js";

async function getByEnquiryNumberForSeller(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request for a quote.",
      });
    }

    const { enquiryNumber } = req.params;

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
    const queryConditions = {
      $or: [
        { categoryId: { $in: categoryIds } },
        { subCategoryId: { $in: subCategoryIds } },
      ],
    };

    // If enquiryNumber is provided, include it in the query conditions
    if (enquiryNumber) {
      queryConditions.enquiryNumber = enquiryNumber;
    }

    const products = await Product.find(queryConditions)
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

    const formattedProducts = products.map((product) => {
      const quoteRequest = quoteRequestsMap[product.enquiryNumber] || null;

      return {
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
        //quote request details
        quoteRequestId: quoteRequest?.id || null,
        deliveryAddress: quoteRequest?.deliveryAddress || null,
        deliveryLocation: quoteRequest?.deliveryLocation || null,
        deliveryLandMark: quoteRequest?.deliveryLandMark || null,
        deliveryPincode: quoteRequest?.deliveryPincode || null,
        expectedDeliveryDate: quoteRequest?.expectedDeliveryDate || null,
        buyerStatus: quoteRequest?.buyerStatus || null,
        supplierStatus: quoteRequest?.supplierStatus || null,
        edprowiseStatus: quoteRequest?.edprowiseStatus || null,
        createdAt: quoteRequest?.createdAt || null,
        updatedAt: quoteRequest?.updatedAt || null,
      };
    });

    return res.status(200).json({
      hasError: false,
      message: "Data fetched successfully.",
      data: {
        products: formattedProducts,
      },
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

export default getByEnquiryNumberForSeller;
