// import SellerProfile from "../../models/SellerProfile.js";
// import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
// import QuoteRequest from "../../models/QuoteRequest.js";
// import Product from "../../models/Product.js";
// import OrderFromBuyer from "../../models/OrderFromBuyer.js";

// async function getTotalCountForSeller(req, res) {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Seller ID is required.",
//       });
//     }

//     // Fetch the seller's profile to get the dealing products
//     const sellerProfile = await SellerProfile.findOne({ sellerId: id })
//       .populate("dealingProducts.categoryId")
//       .populate("dealingProducts.subCategoryIds");

//     if (!sellerProfile) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Seller profile not found.",
//       });
//     }

//     // Extract the dealing products and subcategory IDs
//     const dealingProducts = sellerProfile.dealingProducts;
//     const sellerSubCategoryIds = dealingProducts.flatMap((product) =>
//       product.subCategoryIds.map((id) => id.toString())
//     );

//     // Create arrays for categoryIds and subCategoryIds
//     const categoryIds = dealingProducts.map((product) => product.categoryId);
//     const subCategoryIds = dealingProducts.flatMap(
//       (product) => product.subCategoryIds
//     );

//     // Find all products that match the seller's dealing products
//     const products = await Product.find({
//       $or: [
//         { categoryId: { $in: categoryIds } },
//         { subCategoryId: { $in: subCategoryIds } },
//       ],
//     })
//       .select("enquiryNumber subCategoryId")
//       .lean();

//     // Get unique enquiry numbers
//     const enquiryNumbers = [...new Set(products.map((p) => p.enquiryNumber))];

//     // Fetch all relevant orders from buyers
//     const orderFromBuyers = await OrderFromBuyer.find({
//       enquiryNumber: { $in: enquiryNumbers },
//     })
//       .select("enquiryNumber subCategoryId sellerId")
//       .lean();

//     // Create a map of orders by enquiry number and subcategory
//     const orderFromBuyerMap = orderFromBuyers.reduce((acc, order) => {
//       const key = `${order.enquiryNumber}-${order.subCategoryId.toString()}`;
//       if (!acc[key]) {
//         acc[key] = [];
//       }
//       acc[key].push(order);
//       return acc;
//     }, {});

//     // Count products based on the three scenarios
//     let case1Count = 0; // No orders exist
//     let case2Count = 0; // Current seller has order
//     let case3Count = 0; // Other sellers have orders but current seller doesn't

//     // Create a map to track counted enquiry numbers (to avoid double counting)
//     const countedEnquiries = new Set();

//     products.forEach((product) => {
//       const productKey = `${product.enquiryNumber}-${product.subCategoryId}`;
//       const ordersForProduct = orderFromBuyerMap[productKey] || [];

//       // Skip if we've already counted this enquiry
//       if (countedEnquiries.has(product.enquiryNumber)) {
//         return;
//       }

//       // Case 1: No orders exist for this enquiryNumber + subCategory combination
//       if (ordersForProduct.length === 0) {
//         case1Count++;
//         countedEnquiries.add(product.enquiryNumber);
//         return;
//       }

//       // Case 2: Check if current seller has an order for this product
//       const sellerHasOrder = ordersForProduct.some(
//         (order) => order.sellerId.toString() === id
//       );

//       // Case 3: Other sellers have orders but current seller doesn't
//       const otherSellersHaveOrders = ordersForProduct.some(
//         (order) => order.sellerId.toString() !== id
//       );

//       if (sellerHasOrder) {
//         case2Count++;
//         countedEnquiries.add(product.enquiryNumber);
//       } else if (otherSellersHaveOrders) {
//         case3Count++;
//         countedEnquiries.add(product.enquiryNumber);
//       }
//     });

//     // Count subcategories
//     const subCategoryCount = sellerProfile.dealingProducts.reduce(
//       (total, product) => total + (product.subCategoryIds?.length || 0),
//       0
//     );

//     // Count orders
//     const orderCount = await OrderDetailsFromSeller.countDocuments({
//       sellerId: id,
//     });

//     // Total quote requests is the sum of case1 and case2 (visible to seller)
//     const totalQuoteRequest = case1Count + case2Count;

//     return res.status(200).json({
//       message: "Data fetched successfully",
//       data: {
//         totalSubcategory: subCategoryCount,
//         totalOrder: orderCount,
//         totalQuoteRequest,
//         breakdown: {
//           case1Count, // No orders exist
//           case2Count, // Current seller has order
//           case3Count, // Other sellers have orders but current seller doesn't
//         },
//       },
//       hasError: false,
//     });
//   } catch (error) {
//     console.error("Error fetching counts:", error);
//     return res.status(500).json({
//       message: "Failed to fetch data.",
//       error: error.message,
//       hasError: true,
//     });
//   }
// }

// export default getTotalCountForSeller;

import SellerProfile from "../../models/SellerProfile.js";
import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import Product from "../../models/Product.js";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";

async function getTotalCountForSeller(req, res) {
  try {
    const { id: sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "Seller ID is required.",
      });
    }

    // Fetch seller profile with dealing products
    const sellerProfile = await SellerProfile.findOne({ sellerId })
      .populate("dealingProducts.categoryId")
      .populate("dealingProducts.subCategoryIds");

    if (!sellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found.",
      });
    }

    // Build match conditions based on seller's dealing products
    const productMatchConditions = sellerProfile.dealingProducts.flatMap(
      (product) =>
        product.subCategoryIds.map((subCategoryId) => ({
          categoryId: product.categoryId._id,
          subCategoryId: subCategoryId._id,
        }))
    );

    // Find matching products
    const products = await Product.find({
      $or: productMatchConditions.map((c) => ({
        categoryId: c.categoryId,
        subCategoryId: c.subCategoryId,
      })),
    })
      .sort({ createdAt: -1 })
      .select("enquiryNumber subCategoryId")
      .lean();

    const enquiryNumbers = [...new Set(products.map((p) => p.enquiryNumber))];

    // Fetch orders related to those enquiryNumbers
    const orders = await OrderFromBuyer.find({
      enquiryNumber: { $in: enquiryNumbers },
    }).lean();

    const orderMap = new Map();
    orders.forEach((order) => {
      const key = `${order.enquiryNumber}-${order.subCategoryId}`;
      if (!orderMap.has(key)) orderMap.set(key, new Set());
      orderMap.get(key).add(order.sellerId.toString());
    });

    const seenEnquiryNumbers = new Set();
    let quoteRequestCount = 0;

    for (const product of products) {
      const key = `${product.enquiryNumber}-${product.subCategoryId}`;
      const sellerIdsForKey = orderMap.get(key) || new Set();

      // Count only once per enquiryNumber
      if (seenEnquiryNumbers.has(product.enquiryNumber)) continue;

      const isExcluded =
        sellerIdsForKey.size > 0 && !sellerIdsForKey.has(sellerId.toString());

      if (!isExcluded) {
        seenEnquiryNumbers.add(product.enquiryNumber);
        quoteRequestCount++;
      }
    }

    // Total subcategories the seller deals in
    const subCategoryCount = sellerProfile.dealingProducts.reduce(
      (total, product) => total + (product.subCategoryIds?.length || 0),
      0
    );

    // Total orders placed by seller
    const orderCount = await OrderDetailsFromSeller.countDocuments({
      sellerId,
    });

    return res.status(200).json({
      hasError: false,
      message: "Data fetched successfully.",
      data: {
        totalSubcategory: subCategoryCount,
        totalOrder: orderCount,
        totalQuoteRequest: quoteRequestCount,
      },
    });
  } catch (error) {
    console.error("Error in getTotalCountForSeller:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch data.",
      error: error.message,
    });
  }
}

export default getTotalCountForSeller;
