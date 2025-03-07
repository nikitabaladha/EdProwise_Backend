import School from "../../models/School.js";
import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteRequest from "../../models/QuoteRequest.js";

async function getTotalCountForSchool(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    // Fetch school profile
    const schoolProfile = await School.findOne({ schoolId: id }).lean();

    if (!schoolProfile) {
      return res.status(404).json({
        hasError: true,
        message: "School profile not found.",
      });
    }

    // Count quote requests for the school
    const quoteRequestCount = await QuoteRequest.countDocuments({
      schoolId: id,
    });

    // Count orders for the school
    const orderCount = await OrderDetailsFromSeller.countDocuments({
      schoolId: id,
    });

    return res.status(200).json({
      message: "Data fetched successfully",
      data: {
        totalOrder: orderCount,
        totalQuoteRequest: quoteRequestCount,
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

export default getTotalCountForSchool;
