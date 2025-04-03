import QuoteRequest from "../../models/QuoteRequest.js";
import Product from "../../models/Product.js";
import SellerProfile from "../../models/SellerProfile.js";
import SubmitQuote from "../../models/SubmitQuote.js";
import QuoteProposal from "../../models/QuoteProposal.js";

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
      .sort({ createdAt: -1 })
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
        const existingSubmittedQuote = await SubmitQuote.findOne({
          enquiryNumber: product.enquiryNumber,
          sellerId,
        });

        const venderStatusFromBuyer =
          existingSubmittedQuote?.venderStatusFromBuyer || null;
        const rejectCommentFromBuyer =
          existingSubmittedQuote?.rejectCommentFromBuyer || null;

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
          venderStatusFromBuyer, // Include vendor status from buyer
          rejectCommentFromBuyer,
        });
      }
    }

    const formattedProducts = Array.from(enquiryProductMap.values());

    const enquiryNumbers = formattedProducts.map((p) => p.enquiryNumber);

    const quoteProposals = await QuoteProposal.find({
      enquiryNumber: { $in: enquiryNumbers },
    });

    const quoteProposalMap = quoteProposals.reduce((acc, quoteProposal) => {
      if (!acc[quoteProposal.enquiryNumber]) {
        acc[quoteProposal.enquiryNumber] = [];
      }
      acc[quoteProposal.enquiryNumber].push(quoteProposal);
      return acc;
    }, {});

    const filteredProducts = formattedProducts.filter((product) => {
      const quoteProposals = quoteProposalMap[product.enquiryNumber] || [];

      if (quoteProposals.length === 0) return true;

      const hasSellerQuoteProposal = quoteProposals.some(
        (quoteProposal) =>
          quoteProposal.sellerId.toString() === sellerId.toString()
      );

      return hasSellerQuoteProposal;
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
