import SellerProfile from "../../models/SellerProfile.js";
import OrderDetailsFromSeller from "../../models/ProcurementService/OrderDetailsFromSeller.js";
import Product from "../../models/ProcurementService/Product.js";
import OrderFromBuyer from "../../models/ProcurementService/OrderFromBuyer.js";

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
