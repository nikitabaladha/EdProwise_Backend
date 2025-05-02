// import QuoteRequest from "../../models/QuoteRequest.js";
// import Product from "../../models/Product.js";
// import SellerProfile from "../../models/SellerProfile.js";
// import SubmitQuote from "../../models/SubmitQuote.js";
// import OrderFromBuyer from "../../models/OrderFromBuyer.js";

// async function getProductsForSeller(req, res) {
//   try {
//     const sellerId = req.user?.id;

//     if (!sellerId) {
//       return res.status(401).json({
//         hasError: true,
//         message:
//           "Access denied: You do not have permission to request for a quote.",
//       });
//     }

//     // Fetch the seller's profile to get the dealing products
//     const sellerProfile = await SellerProfile.findOne({ sellerId })
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
//       .sort({ createdAt: -1 })
//       .populate("categoryId", "categoryName")
//       .populate("subCategoryId", "subCategoryName");

//     // Fetch quote requests associated with the seller
//     const quoteRequests = await QuoteRequest.find();

//     // Create a map of quote requests by enquiry number
//     const quoteRequestsMap = quoteRequests.reduce((acc, quoteRequest) => {
//       acc[quoteRequest.enquiryNumber] = {
//         id: quoteRequest._id,
//         deliveryAddress: quoteRequest.deliveryAddress,
//         deliveryLocation: quoteRequest.deliveryLocation,
//         deliveryLandMark: quoteRequest.deliveryLandMark,
//         deliveryPincode: quoteRequest.deliveryPincode,
//         expectedDeliveryDate: quoteRequest.expectedDeliveryDate,
//         buyerStatus: quoteRequest.buyerStatus,
//         supplierStatus: quoteRequest.supplierStatus,
//         edprowiseStatus: quoteRequest.edprowiseStatus,
//         createdAt: quoteRequest.createdAt,
//         updatedAt: quoteRequest.updatedAt,
//         enquiryNumber: quoteRequest.enquiryNumber,
//       };
//       return acc;
//     }, {});

//     // Store the first product for each unique enquiryNumber
//     const enquiryProductMap = new Map();

//     for (const product of products) {
//       if (!enquiryProductMap.has(product.enquiryNumber)) {
//         const existingSubmittedQuote = await SubmitQuote.findOne({
//           enquiryNumber: product.enquiryNumber,
//           sellerId,
//         });

//         enquiryProductMap.set(product.enquiryNumber, {
//           id: product._id,
//           schoolId: product.schoolId,
//           categoryId: product.categoryId?._id || null,
//           categoryName: product.categoryId?.categoryName || null,
//           subCategoryId: product.subCategoryId?._id || null,
//           subCategoryName: product.subCategoryId?.subCategoryName || null,
//           description: product.description,
//           productImage: product.productImage,
//           unit: product.unit,
//           quantity: product.quantity,
//           enquiryNumber: product.enquiryNumber,
//           quoteRequestId: quoteRequestsMap[product.enquiryNumber]?.id || null,
//           deliveryAddress:
//             quoteRequestsMap[product.enquiryNumber]?.deliveryAddress || null,
//           deliveryLocation:
//             quoteRequestsMap[product.enquiryNumber]?.deliveryLocation || null,
//           deliveryLandMark:
//             quoteRequestsMap[product.enquiryNumber]?.deliveryLandMark || null,
//           deliveryPincode:
//             quoteRequestsMap[product.enquiryNumber]?.deliveryPincode || null,
//           expectedDeliveryDate:
//             quoteRequestsMap[product.enquiryNumber]?.expectedDeliveryDate ||
//             null,
//           buyerStatus:
//             quoteRequestsMap[product.enquiryNumber]?.buyerStatus || null,
//           supplierStatus:
//             quoteRequestsMap[product.enquiryNumber]?.supplierStatus || null,
//           edprowiseStatus:
//             quoteRequestsMap[product.enquiryNumber]?.edprowiseStatus || null,
//           createdAt: quoteRequestsMap[product.enquiryNumber]?.createdAt || null,
//           updatedAt: quoteRequestsMap[product.enquiryNumber]?.updatedAt || null,
//           venderStatusFromBuyer:
//             existingSubmittedQuote?.venderStatusFromBuyer || null,
//           rejectCommentFromBuyer:
//             existingSubmittedQuote?.rejectCommentFromBuyer || null,
//         });
//       }
//     }

//     const formattedProducts = Array.from(enquiryProductMap.values());
//     const enquiryNumbers = formattedProducts.map((p) => p.enquiryNumber);

//     // Fetch all relevant orders from buyers
//     const orderFromBuyers = await OrderFromBuyer.find({
//       enquiryNumber: { $in: enquiryNumbers },
//     });

//     // Create a map of orders by enquiry number and subcategory
//     const orderFromBuyerMap = orderFromBuyers.reduce((acc, order) => {
//       const key = `${order.enquiryNumber}-${order.subCategoryId.toString()}`;
//       if (!acc[key]) {
//         acc[key] = [];
//       }
//       acc[key].push(order);
//       return acc;
//     }, {});

//     // Filter products based on the three scenarios
//     const filteredProducts = formattedProducts.filter((product) => {
//       const productKey = `${product.enquiryNumber}-${product.subCategoryId}`;
//       const ordersForProduct = orderFromBuyerMap[productKey] || [];

//       // Case 1: No orders exist for this enquiryNumber + subCategory combination
//       if (ordersForProduct.length === 0) {
//         return true;
//       }

//       // Case 2: Check if current seller has an order for this product
//       const sellerHasOrder = ordersForProduct.some(
//         (order) => order.sellerId.toString() === sellerId.toString()
//       );

//       // Case 3: Other sellers have orders but current seller doesn't
//       const otherSellersHaveOrders = ordersForProduct.some(
//         (order) => order.sellerId.toString() !== sellerId.toString()
//       );

//       return sellerHasOrder;
//     });

//     return res.status(200).json({
//       hasError: false,
//       message: "Data fetched successfully.",
//       data: filteredProducts,
//     });
//   } catch (error) {
//     console.error("Error fetching productss for seller:", error.message);
//     return res.status(500).json({
//       hasError: true,
//       message: "Failed to fetch data.",
//       error: error.message,
//     });
//   }
// }

// export default getProductsForSeller;
import QuoteRequest from "../../models/QuoteRequest.js";
import Product from "../../models/Product.js";
import SellerProfile from "../../models/SellerProfile.js";
import SubmitQuote from "../../models/SubmitQuote.js";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";

async function getProductsForSeller(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to request for a quote.",
      });
    }

    // Fetch the seller's profile
    const sellerProfile = await SellerProfile.findOne({ sellerId })
      .populate("dealingProducts.categoryId")
      .populate("dealingProducts.subCategoryIds");

    if (!sellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found.",
      });
    }

    const dealingProducts = sellerProfile.dealingProducts;
    const categoryIds = dealingProducts.map((product) => product.categoryId);
    const subCategoryIds = dealingProducts.flatMap((product) => product.subCategoryIds);

    // Find products matching seller's category or subcategory
    const products = await Product.find({
      $or: [
        { categoryId: { $in: categoryIds } },
        { subCategoryId: { $in: subCategoryIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("categoryId", "categoryName")
      .populate("subCategoryId", "subCategoryName");

    // Fetch all quote requests
    const quoteRequests = await QuoteRequest.find();

    // Map quoteRequests by enquiryNumber
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

    // Map first product per enquiryNumber
    const enquiryProductMap = new Map();

    for (const product of products) {
      if (!enquiryProductMap.has(product.enquiryNumber)) {
        const existingSubmittedQuote = await SubmitQuote.findOne({
          enquiryNumber: product.enquiryNumber,
          sellerId,
        });

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
          quoteRequestId: quoteRequestsMap[product.enquiryNumber]?.id || null,
          deliveryAddress: quoteRequestsMap[product.enquiryNumber]?.deliveryAddress || null,
          deliveryLocation: quoteRequestsMap[product.enquiryNumber]?.deliveryLocation || null,
          deliveryLandMark: quoteRequestsMap[product.enquiryNumber]?.deliveryLandMark || null,
          deliveryPincode: quoteRequestsMap[product.enquiryNumber]?.deliveryPincode || null,
          expectedDeliveryDate: quoteRequestsMap[product.enquiryNumber]?.expectedDeliveryDate || null,
          buyerStatus: quoteRequestsMap[product.enquiryNumber]?.buyerStatus || null,
          supplierStatus: quoteRequestsMap[product.enquiryNumber]?.supplierStatus || null,
          edprowiseStatus: quoteRequestsMap[product.enquiryNumber]?.edprowiseStatus || null,
          createdAt: quoteRequestsMap[product.enquiryNumber]?.createdAt || null,
          updatedAt: quoteRequestsMap[product.enquiryNumber]?.updatedAt || null,
          venderStatusFromBuyer: existingSubmittedQuote?.venderStatusFromBuyer || null,
          rejectCommentFromBuyer: existingSubmittedQuote?.rejectCommentFromBuyer || null,
        });
      }
    }

    const formattedProducts = Array.from(enquiryProductMap.values());
    const enquiryNumbers = formattedProducts.map((p) => p.enquiryNumber);

    // Fetch orders related to the enquiryNumbers
    const orderFromBuyers = await OrderFromBuyer.find({
      enquiryNumber: { $in: enquiryNumbers },
    });

    // Map orders by enquiryNumber-subCategoryId
    const orderFromBuyerMap = orderFromBuyers.reduce((acc, order) => {
      const enquiryNumber = order.enquiryNumber || "";
      const subCategoryId = order.subCategoryId ? order.subCategoryId.toString() : "";
      const key = `${enquiryNumber}-${subCategoryId}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(order);
      return acc;
    }, {});

    // Filter products based on order conditions
    const filteredProducts = formattedProducts.filter((product) => {
      const enquiryNumber = product.enquiryNumber || "";
      const subCategoryId = product.subCategoryId ? product.subCategoryId.toString() : "";
      const key = `${enquiryNumber}-${subCategoryId}`;

      const relatedOrders = orderFromBuyerMap[key] || [];

      if (relatedOrders.length === 0) {
        return true; // No orders exist for this product
      }

      const sellerHasOrder = relatedOrders.some(
        (order) => order.sellerId?.toString() === sellerId.toString()
      );

      return sellerHasOrder;
    });

    return res.status(200).json({
      hasError: false,
      message: "Data fetched successfully.",
      data: filteredProducts,
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
