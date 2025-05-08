import QuoteRequest from "../../models/QuoteRequest.js";
import Product from "../../models/Product.js";
import SellerProfile from "../../models/SellerProfile.js";
import SubmitQuote from "../../models/SubmitQuote.js";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";

// This api works fine but i want that for that enquiryNumber, categoryId and subcategoryId with other seller's
// sellerId (not his own) found combinely in orderFromBuyer that is there any entry with all together
// if yes then exclude that perticular thing or filterout that first product and find another one
// if all gets filter out then dont send anything in response but if anything remains at that time which ever is remain then send that
// first product in response

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

//     // Create an array of conditions that require BOTH category and subcategory to match
//     const productMatchConditions = sellerProfile.dealingProducts.flatMap(
//       (product) => {
//         return product.subCategoryIds.map((subCategoryId) => ({
//           categoryId: product.categoryId._id,
//           subCategoryId: subCategoryId._id,
//         }));
//       }
//     );

//     // Build the query conditions
//     const queryConditions = {
//       $or: productMatchConditions.map((condition) => ({
//         categoryId: condition.categoryId,
//         subCategoryId: condition.subCategoryId,
//       })),
//     };

//     // Find all products that match the seller's dealing products
//     const products = await Product.find(queryConditions)
//       .sort({ createdAt: -1 })
//       .populate("categoryId", "categoryName")
//       .populate("subCategoryId", "subCategoryName");

//     // Rest of your code remains the same...
//     const quoteRequests = await QuoteRequest.find();
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
//           productImages: product.productImages || [],
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
//     console.error("Error fetching products for seller:", error.message);
//     return res.status(500).json({
//       hasError: true,
//       message: "Failed to fetch data.",
//       error: error.message,
//     });
//   }
// }

async function getProductsForSeller(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request for a quote.",
      });
    }

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

    // Create an array of conditions that require BOTH category and subcategory to match
    const productMatchConditions = sellerProfile.dealingProducts.flatMap(
      (product) => {
        return product.subCategoryIds.map((subCategoryId) => ({
          categoryId: product.categoryId._id,
          subCategoryId: subCategoryId._id,
        }));
      }
    );

    // Build the query conditions
    const queryConditions = {
      $or: productMatchConditions.map((condition) => ({
        categoryId: condition.categoryId,
        subCategoryId: condition.subCategoryId,
      })),
    };

    // Find all products that match the seller's dealing products
    const products = await Product.find(queryConditions)
      .sort({ createdAt: -1 })
      .populate("categoryId", "categoryName")
      .populate("subCategoryId", "subCategoryName");

    // Get all enquiry numbers from the products
    const enquiryNumbers = [...new Set(products.map((p) => p.enquiryNumber))];

    // Fetch all orders that match these enquiry numbers
    const orders = await OrderFromBuyer.find({
      enquiryNumber: { $in: enquiryNumbers },
    }).populate("subCategoryId");

    // Create a set of excluded product keys (enquiryNumber + categoryId + subCategoryId)
    const excludedProducts = new Set();
    orders.forEach((order) => {
      if (order.sellerId.toString() !== sellerId.toString()) {
        const key = `${order.enquiryNumber}-${order.subCategoryId._id}`;
        excludedProducts.add(key);
      }
    });

    // Fetch quote requests
    const quoteRequests = await QuoteRequest.find();
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

    // Filter out products that have orders from other sellers
    const filteredProducts = [];
    const seenEnquiryNumbers = new Set();

    for (const product of products) {
      const key = `${product.enquiryNumber}-${product.subCategoryId._id}`;

      // Only include if not excluded and we haven't seen this enquiry number yet
      if (
        !excludedProducts.has(key) &&
        !seenEnquiryNumbers.has(product.enquiryNumber)
      ) {
        seenEnquiryNumbers.add(product.enquiryNumber);

        const existingSubmittedQuote = await SubmitQuote.findOne({
          enquiryNumber: product.enquiryNumber,
          sellerId,
        });

        filteredProducts.push({
          id: product._id,
          schoolId: product.schoolId,
          categoryId: product.categoryId?._id || null,
          categoryName: product.categoryId?.categoryName || null,
          subCategoryId: product.subCategoryId?._id || null,
          subCategoryName: product.subCategoryId?.subCategoryName || null,
          description: product.description,
          productImages: product.productImages || [],
          unit: product.unit,
          quantity: product.quantity,
          enquiryNumber: product.enquiryNumber,
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
          venderStatusFromBuyer:
            existingSubmittedQuote?.venderStatusFromBuyer || null,
          rejectCommentFromBuyer:
            existingSubmittedQuote?.rejectCommentFromBuyer || null,
        });
      }
    }

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
