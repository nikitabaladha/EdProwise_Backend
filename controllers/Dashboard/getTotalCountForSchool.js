import School from "../../models/School.js";
import OrderDetailsFromSeller from "../../models/ProcurementService/OrderDetailsFromSeller.js";
import QuoteRequest from "../../models/ProcurementService/QuoteRequest.js";
import QuoteProposal from "../../models/ProcurementService/QuoteProposal.js";

async function getTotalCountForSchool(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const schoolProfile = await School.findOne({ schoolId: id }).lean();

    if (!schoolProfile) {
      return res.status(404).json({
        hasError: true,
        message: "School profile not found.",
      });
    }

    const quoteRequests = await QuoteRequest.find({ schoolId: id })
      .select("enquiryNumber")
      .lean();

    const enquiryNumbers = quoteRequests.map((req) => req.enquiryNumber);

    const quoteRequestCount = quoteRequests.length;

    const orderCount = await OrderDetailsFromSeller.countDocuments({
      schoolId: id,
    });

    let totalAmount = 0;

    if (enquiryNumbers.length > 0) {
      const aggregation = await QuoteProposal.aggregate([
        {
          $match: {
            enquiryNumber: { $in: enquiryNumbers },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]);

      totalAmount = aggregation[0]?.total || 0;
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      data: {
        totalOrder: orderCount,
        totalQuoteRequest: quoteRequestCount,
        totalQuoteProposalAmount: totalAmount,
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
