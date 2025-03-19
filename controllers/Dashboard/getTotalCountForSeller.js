import SellerProfile from "../../models/SellerProfile.js";
import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import Product from "../../models/Product.js";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";

async function getTotalCountForSeller(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Seller ID is required.",
      });
    }

    // Fetch seller profile
    const sellerProfile = await SellerProfile.findOne({ sellerId: id }).lean();

    if (!sellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found.",
      });
    }

    // Extract category and subcategory IDs
    const categoryIds = sellerProfile.dealingProducts.map(
      (product) => product.categoryId
    );
    const subCategoryIds = sellerProfile.dealingProducts.flatMap(
      (product) => product.subCategoryIds
    );

    // Find matching products
    const matchingProducts = await Product.find({
      $or: [
        { categoryId: { $in: categoryIds } },
        { subCategoryId: { $in: subCategoryIds } },
      ],
    }).select("enquiryNumber");

    // Extract unique enquiry numbers
    const enquiryNumbers = [
      ...new Set(matchingProducts.map((p) => p.enquiryNumber)),
    ];

    // Fetch all quote requests for these enquiry numbers
    const quoteRequests = await QuoteRequest.find({
      enquiryNumber: { $in: enquiryNumbers },
    });

    // Fetch all OrderFromBuyer records for these enquiry numbers
    const orderFromBuyers = await OrderFromBuyer.find({
      enquiryNumber: { $in: enquiryNumbers },
    });

    // Create a map of orders by enquiry number
    const orderMap = orderFromBuyers.reduce((acc, order) => {
      if (!acc[order.enquiryNumber]) {
        acc[order.enquiryNumber] = [];
      }
      acc[order.enquiryNumber].push(order);
      return acc;
    }, {});

    // Filter quote requests based on order conditions
    const filteredQuoteRequests = quoteRequests.filter((quoteRequest) => {
      const orders = orderMap[quoteRequest.enquiryNumber] || [];

      // Case 1: No orders exist for this enquiry number
      if (orders.length === 0) return true;

      // Case 2: Check if any order exists for this enquiry number and sellerId
      return orders.some((order) => order.sellerId.toString() === id.toString());
    });

    // Count subcategories
    const subCategoryCount = sellerProfile.dealingProducts.reduce(
      (total, product) => total + (product.subCategoryIds?.length || 0),
      0
    );

    // Count orders
    const orderCount = await OrderDetailsFromSeller.countDocuments({
      sellerId: id,
    });

    return res.status(200).json({
      message: "Data fetched successfully",
      data: {
        totalSubcategory: subCategoryCount,
        totalOrder: orderCount,
        totalQuoteRequest: filteredQuoteRequests.length, // Updated count
      },
      hasError: false,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    return res.status(500).json({
      message: "Failed to fetch data.",
      error: error.message,
      hasError: true,
    });
  }
}

export default getTotalCountForSeller;