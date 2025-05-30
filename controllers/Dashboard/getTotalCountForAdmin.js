import SchoolRegistration from "../../models/School.js";
import SellerProfile from "../../models/SellerProfile.js";
import QuoteRequest from "../../models/ProcurementService/QuoteRequest.js";
import OrderDetailsFromSeller from "../../models/ProcurementService/OrderDetailsFromSeller.js";
import Subscription from "../../models/Subscription.js";
import SubCategory from "../../models/ProcurementService/SubCategory.js";
async function getCounts(req, res) {
  try {
    const [
      schoolCount,
      sellerCount,
      quoteCount,
      orderCount,
      subscriptionCount,
      subCategoryCount,
    ] = await Promise.all([
      SchoolRegistration.countDocuments(),
      SellerProfile.countDocuments(),
      QuoteRequest.countDocuments(),
      OrderDetailsFromSeller.countDocuments(),
      Subscription.countDocuments(),
      SubCategory.countDocuments(),
    ]);

    return res.status(200).json({
      message: "Data fetched successfully",
      data: {
        totalSchools: schoolCount,
        totalSellers: sellerCount,
        totalQuotes: quoteCount,
        OrderDetailsFromSeller: orderCount,
        totalSubscriptions: subscriptionCount,
        totalSubCategories: subCategoryCount,
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

export default getCounts;
