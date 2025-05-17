// import QuoteRequest from "../../models/QuoteRequest.js";
// import Product from "../../models/Product.js";
// import SellerProfile from "../../models/SellerProfile.js";
// import OrderFromBuyer from "../../models/OrderFromBuyer.js";

// This api works fine but i want that for that enquiryNumber, categoryId and subcategoryId with other seller's
// sellerId (not his own) found combinely that is there any entry with all together
// if yes then exclude that perticular thing or filterout that and dont send that data in response
// other remaining thing must be send in response

// async function getByEnquiryNumberForSeller(req, res) {
//   try {
//     const sellerId = req.user?.id;

//     if (!sellerId) {
//       return res.status(401).json({
//         hasError: true,
//         message:
//           "Access denied: You do not have permission to request for a quote.",
//       });
//     }

//     const { enquiryNumber } = req.params;

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

//     // If enquiryNumber is provided, include it in the query conditions
//     if (enquiryNumber) {
//       queryConditions.enquiryNumber = enquiryNumber;
//     }

//     const products = await Product.find(queryConditions)
//       .populate({
//         path: "categoryId",
//         select: "categoryName edprowiseMargin",
//       })
//       .populate({
//         path: "subCategoryId",
//         select: "subCategoryName",
//       })
//       .exec();

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

//     const formattedProducts = products.map((product) => {
//       const quoteRequest = quoteRequestsMap[product.enquiryNumber] || null;

//       return {
//         id: product._id,
//         schoolId: product.schoolId,
//         categoryId: product.categoryId?._id || null,
//         edprowiseMargin: product.categoryId?.edprowiseMargin || null,
//         categoryName: product.categoryId?.categoryName || null,
//         subCategoryId: product.subCategoryId?._id || null,
//         subCategoryName: product.subCategoryId?.subCategoryName || null,
//         description: product.description,
//         productImages: product.productImages || [],
//         unit: product.unit,
//         quantity: product.quantity,
//         enquiryNumber: product.enquiryNumber,
//         quoteRequestId: quoteRequest?.id || null,
//         deliveryAddress: quoteRequest?.deliveryAddress || null,
//         deliveryLocation: quoteRequest?.deliveryLocation || null,
//         deliveryLandMark: quoteRequest?.deliveryLandMark || null,
//         deliveryPincode: quoteRequest?.deliveryPincode || null,
//         expectedDeliveryDate: quoteRequest?.expectedDeliveryDate || null,
//         buyerStatus: quoteRequest?.buyerStatus || null,
//         supplierStatus: quoteRequest?.supplierStatus || null,
//         edprowiseStatus: quoteRequest?.edprowiseStatus || null,
//         createdAt: quoteRequest?.createdAt || null,
//         updatedAt: quoteRequest?.updatedAt || null,
//       };
//     });

//     return res.status(200).json({
//       hasError: false,
//       message: "Data fetched successfully.",
//       data: {
//         products: formattedProducts,
//       },
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

// export default getByEnquiryNumberForSeller;

// ========================Half Working===========================

// =======================================

// import QuoteRequest from "../../models/QuoteRequest.js";
// import Product from "../../models/Product.js";
// import SellerProfile from "../../models/SellerProfile.js";
// import OrderFromBuyer from "../../models/OrderFromBuyer.js";

// async function getByEnquiryNumberForSeller(req, res) {
//   try {
//     const sellerId = req.user?.id;

//     if (!sellerId) {
//       return res.status(401).json({
//         hasError: true,
//         message:
//           "Access denied: You do not have permission to request for a quote.",
//       });
//     }

//     const { enquiryNumber } = req.params;

//     const sellerProfile = await SellerProfile.findOne({ sellerId })
//       .populate("dealingProducts.categoryId")
//       .populate("dealingProducts.subCategoryIds");

//     if (!sellerProfile) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Seller profile not found.",
//       });
//     }

//     // Build conditions for matching category + subcategory
//     const productMatchConditions = sellerProfile.dealingProducts.flatMap(
//       (product) =>
//         product.subCategoryIds.map((subCategoryId) => ({
//           categoryId: product.categoryId._id,
//           subCategoryId: subCategoryId._id,
//         }))
//     );

//     const queryConditions = {
//       $or: productMatchConditions.map((condition) => ({
//         categoryId: condition.categoryId,
//         subCategoryId: condition.subCategoryId,
//       })),
//     };

//     if (enquiryNumber) {
//       queryConditions.enquiryNumber = enquiryNumber;
//     }

//     const products = await Product.find(queryConditions)
//       .populate({ path: "categoryId", select: "categoryName edprowiseMargin" })
//       .populate({ path: "subCategoryId", select: "subCategoryName" });

//     if (!products.length) {
//       return res.status(200).json({
//         hasError: false,
//         message: "No matching products found.",
//         data: { products: [] },
//       });
//     }

//     const enquiryNumbers = [...new Set(products.map((p) => p.enquiryNumber))];

//     const orders = await OrderFromBuyer.find({
//       enquiryNumber: { $in: enquiryNumbers },
//     });

//     // Build map: key = enquiryNumber-subCategoryId, value = array of sellerIds
//     const orderMap = new Map();
//     orders.forEach((order) => {
//       const key = `${order.enquiryNumber}-${order.subCategoryId.toString()}`;
//       if (!orderMap.has(key)) {
//         orderMap.set(key, []);
//       }
//       orderMap.get(key).push(order.sellerId.toString());
//     });

//     // ✅ Fix: ensure subCategoryId is compared as string!
//     const filteredProducts = products.filter((product) => {
//       const key = `${
//         product.enquiryNumber
//       }-${product.subCategoryId._id.toString()}`;
//       const sellerIds = orderMap.get(key);

//       // Include if no orders or current seller is among the ones who ordered
//       if (!sellerIds || sellerIds.includes(sellerId.toString())) {
//         return true;
//       }

//       // Exclude if others placed order but not the current seller
//       return false;
//     });

//     // Get quote requests
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

//     const formattedProducts = filteredProducts.map((product) => {
//       const quoteRequest = quoteRequestsMap[product.enquiryNumber] || null;

//       return {
//         id: product._id,
//         schoolId: product.schoolId,
//         categoryId: product.categoryId?._id || null,
//         edprowiseMargin: product.categoryId?.edprowiseMargin || null,
//         categoryName: product.categoryId?.categoryName || null,
//         subCategoryId: product.subCategoryId?._id || null,
//         subCategoryName: product.subCategoryId?.subCategoryName || null,
//         description: product.description,
//         productImages: product.productImages || [],
//         unit: product.unit,
//         quantity: product.quantity,
//         enquiryNumber: product.enquiryNumber,
//         quoteRequestId: quoteRequest?.id || null,
//         deliveryAddress: quoteRequest?.deliveryAddress || null,
//         deliveryLocation: quoteRequest?.deliveryLocation || null,
//         deliveryLandMark: quoteRequest?.deliveryLandMark || null,
//         deliveryPincode: quoteRequest?.deliveryPincode || null,
//         expectedDeliveryDate: quoteRequest?.expectedDeliveryDate || null,
//         buyerStatus: quoteRequest?.buyerStatus || null,
//         supplierStatus: quoteRequest?.supplierStatus || null,
//         edprowiseStatus: quoteRequest?.edprowiseStatus || null,
//         createdAt: quoteRequest?.createdAt || null,
//         updatedAt: quoteRequest?.updatedAt || null,
//       };
//     });

//     return res.status(200).json({
//       hasError: false,
//       message: "Data fetched successfully.",
//       data: {
//         products: formattedProducts,
//       },
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

// export default getByEnquiryNumberForSeller;

// import QuoteRequest from "../../models/QuoteRequest.js";
// import Product from "../../models/Product.js";
// import SellerProfile from "../../models/SellerProfile.js";
// import OrderFromBuyer from "../../models/OrderFromBuyer.js";

// async function getByEnquiryNumberForSeller(req, res) {
//   try {
//     const sellerId = req.user?.id;

//     if (!sellerId) {
//       return res.status(401).json({
//         hasError: true,
//         message:
//           "Access denied: You do not have permission to request for a quote.",
//       });
//     }

//     const { enquiryNumber } = req.params;

//     const sellerProfile = await SellerProfile.findOne({ sellerId })
//       .populate("dealingProducts.categoryId")
//       .populate("dealingProducts.subCategoryIds");

//     if (!sellerProfile) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Seller profile not found.",
//       });
//     }

//     // Build conditions for matching category + subcategory
//     const productMatchConditions = sellerProfile.dealingProducts.flatMap(
//       (product) =>
//         product.subCategoryIds.map((subCategoryId) => ({
//           categoryId: product.categoryId._id,
//           subCategoryId: subCategoryId._id,
//         }))
//     );

//     const queryConditions = {
//       $or: productMatchConditions.map((condition) => ({
//         categoryId: condition.categoryId,
//         subCategoryId: condition.subCategoryId,
//       })),
//     };

//     if (enquiryNumber) {
//       queryConditions.enquiryNumber = enquiryNumber;
//     }

//     const products = await Product.find(queryConditions)
//       .populate({ path: "categoryId", select: "categoryName edprowiseMargin" })
//       .populate({ path: "subCategoryId", select: "subCategoryName" });

//     if (!products.length) {
//       return res.status(200).json({
//         hasError: false,
//         message: "No matching products found.",
//         data: { products: [] },
//       });
//     }

//     const enquiryNumbers = [...new Set(products.map((p) => p.enquiryNumber))];

//     const orders = await OrderFromBuyer.find({
//       enquiryNumber: { $in: enquiryNumbers },
//     });

//     // Build map: key = enquiryNumber-subCategoryId, value = array of sellerIds
//     const orderMap = new Map();
//     orders.forEach((order) => {
//       const key = `${order.enquiryNumber}-${order.subCategoryId.toString()}`;
//       if (!orderMap.has(key)) {
//         orderMap.set(key, []);
//       }
//       orderMap.get(key).push(order.sellerId.toString());
//     });

//     // ✅ Fix: ensure subCategoryId is compared as string!
//     const filteredProducts = products.filter((product) => {
//       const key = `${
//         product.enquiryNumber
//       }-${product.subCategoryId._id.toString()}`;
//       const sellerIds = orderMap.get(key);

//       // Include if no orders or current seller is among the ones who ordered
//       if (!sellerIds || sellerIds.includes(sellerId.toString())) {
//         return true;
//       }

//       // Exclude if others placed order but not the current seller
//       return false;
//     });

//     // Get quote requests
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

//     const formattedProducts = filteredProducts.map((product) => {
//       const quoteRequest = quoteRequestsMap[product.enquiryNumber] || null;

//       return {
//         id: product._id,
//         schoolId: product.schoolId,
//         categoryId: product.categoryId?._id || null,
//         edprowiseMargin: product.categoryId?.edprowiseMargin || null,
//         categoryName: product.categoryId?.categoryName || null,
//         subCategoryId: product.subCategoryId?._id || null,
//         subCategoryName: product.subCategoryId?.subCategoryName || null,
//         description: product.description,
//         productImages: product.productImages || [],
//         unit: product.unit,
//         quantity: product.quantity,
//         enquiryNumber: product.enquiryNumber,
//         quoteRequestId: quoteRequest?.id || null,
//         deliveryAddress: quoteRequest?.deliveryAddress || null,
//         deliveryLocation: quoteRequest?.deliveryLocation || null,
//         deliveryLandMark: quoteRequest?.deliveryLandMark || null,
//         deliveryPincode: quoteRequest?.deliveryPincode || null,
//         expectedDeliveryDate: quoteRequest?.expectedDeliveryDate || null,
//         buyerStatus: quoteRequest?.buyerStatus || null,
//         supplierStatus: quoteRequest?.supplierStatus || null,
//         edprowiseStatus: quoteRequest?.edprowiseStatus || null,
//         createdAt: quoteRequest?.createdAt || null,
//         updatedAt: quoteRequest?.updatedAt || null,
//       };
//     });

//     return res.status(200).json({
//       hasError: false,
//       message: "Data fetched successfully.",
//       data: {
//         products: formattedProducts,
//       },
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

// export default getByEnquiryNumberForSeller;

import QuoteRequest from "../../models/QuoteRequest.js";
import Product from "../../models/Product.js";
import SellerProfile from "../../models/SellerProfile.js";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";

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

    // Build category + subcategory match conditions
    const productMatchConditions = sellerProfile.dealingProducts.flatMap(
      (product) =>
        product.subCategoryIds.map((subCategoryId) => ({
          categoryId: product.categoryId._id,
          subCategoryId: subCategoryId._id,
        }))
    );

    const queryConditions = {
      $or: productMatchConditions.map((condition) => ({
        categoryId: condition.categoryId,
        subCategoryId: condition.subCategoryId,
      })),
    };

    if (enquiryNumber) {
      queryConditions.enquiryNumber = enquiryNumber;
    }

    const products = await Product.find(queryConditions)
      .populate({ path: "categoryId", select: "categoryName edprowiseMargin" })
      .populate({ path: "subCategoryId", select: "subCategoryName" });

    const enquiryNumbers = [...new Set(products.map((p) => p.enquiryNumber))];

    const orders = await OrderFromBuyer.find({
      enquiryNumber: { $in: enquiryNumbers },
    });

    // Map: key = enquiryNumber-subCategoryId, value = array of sellerIds who placed orders
    const orderMap = new Map();
    orders.forEach((order) => {
      const key = `${order.enquiryNumber}-${order.subCategoryId}`;
      if (!orderMap.has(key)) {
        orderMap.set(key, []);
      }
      orderMap.get(key).push(order.sellerId.toString());
    });

    // ✅ Filter products: include only if no one ordered OR current seller has ordered
    const filteredProducts = products.filter((product) => {
      const key = `${product.enquiryNumber}-${product.subCategoryId._id}`;
      const sellerIds = orderMap.get(key);

      if (!sellerIds || sellerIds.includes(sellerId.toString())) {
        return true; // include
      }

      return false; // exclude
    });

    // Map quoteRequests by enquiryNumber
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

    const formattedProducts = filteredProducts.map((product) => {
      const quoteRequest = quoteRequestsMap[product.enquiryNumber] || null;

      return {
        id: product._id,
        schoolId: product.schoolId,
        categoryId: product.categoryId?._id || null,
        edprowiseMargin: product.categoryId?.edprowiseMargin || null,
        categoryName: product.categoryId?.categoryName || null,
        subCategoryId: product.subCategoryId?._id || null,
        subCategoryName: product.subCategoryId?.subCategoryName || null,
        description: product.description,
        productImages: product.productImages || [],
        unit: product.unit,
        quantity: product.quantity,
        enquiryNumber: product.enquiryNumber,
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
