import QuoteRequest from "../../models/ProcurementService/QuoteRequest.js";
import OrderFromBuyer from "../../models/ProcurementService/OrderFromBuyer.js";
import School from "../../models/School.js";
import SellerProfile from "../../models/SellerProfile.js";
import mongoose from "mongoose";

async function get(req, res) {
  const { query } = req.query;

  try {
    const results = [];

    // 1. Search QuoteRequests
    const exactMatchForEnquiryNumber = await QuoteRequest.findOne({
      enquiryNumber: query,
    });
    if (exactMatchForEnquiryNumber) {
      results.push({
        type: "quoteRequest",
        id: exactMatchForEnquiryNumber._id,
        text: exactMatchForEnquiryNumber.enquiryNumber,
        exactMatchForEnquiryNumber: true,
      });
    }

    // 2. Search OrderFromBuyer
    const exactMatchForOrderNumber = await OrderFromBuyer.findOne({
      orderNumber: query,
    });
    if (exactMatchForOrderNumber) {
      results.push({
        type: "orderFromBuyer",
        id: exactMatchForOrderNumber._id,
        text: exactMatchForOrderNumber.orderNumber,
        exactMatchForOrderNumber: true,
      });
    }

    // 3. Search Schools
    const schoolConditions = [
      { schoolName: query, status: { $in: ["Pending", "Completed"] } },
      { schoolId: query, status: { $in: ["Pending", "Completed"] } },
      { schoolEmail: query, status: { $in: ["Pending", "Completed"] } },
      { schoolMobileNo: query, status: { $in: ["Pending", "Completed"] } },
    ];

    const schoolNameMatches = await School.find({
      schoolName: query,
      status: { $in: ["Pending", "Completed"] },
    });

    if (schoolNameMatches.length > 0) {
      if (schoolNameMatches.length === 1) {
        const schoolMatch = schoolNameMatches[0];
        results.push({
          type: "school",
          id: schoolMatch._id,
          text: schoolMatch.schoolName,
          exactMatchForSchoolName: true,
          isSingleMatch: true,
          schoolId: schoolMatch.schoolId,
        });
      } else {
        results.push({
          type: "school",
          text: query,
          exactMatchForSchoolName: true,
          isSingleMatch: false,
          matchCount: schoolNameMatches.length,
        });
      }
    } else {
      const schoolMatch = await School.findOne({ $or: schoolConditions });
      if (schoolMatch) {
        if (schoolMatch.schoolId === query) {
          results.push({
            type: "school",
            id: schoolMatch._id,
            text: schoolMatch.schoolId,
            exactMatchForSchoolId: true,
            isSingleMatch: true,
          });
        }
        if (schoolMatch.schoolEmail === query) {
          results.push({
            type: "school",
            id: schoolMatch._id,
            schoolId: schoolMatch.schoolId,
            text: schoolMatch.schoolEmail,
            exactMatchForSchoolEmail: true,
            isSingleMatch: true,
          });
        }
        if (schoolMatch.schoolMobileNo === query) {
          results.push({
            type: "school",
            id: schoolMatch._id,
            schoolId: schoolMatch.schoolId,
            text: schoolMatch.schoolMobileNo,
            exactMatchForSchoolMobileNumber: true,
            isSingleMatch: true,
          });
        }
        if (schoolMatch.schoolName === query) {
          results.push({
            type: "school",
            id: schoolMatch._id,
            schoolId: schoolMatch.schoolId,
            text: schoolMatch.schoolName,
            exactMatchForSchoolName: true,
            isSingleMatch: true,
          });
        }
      }
    }

    // 4. Search Sellers - Modified to exclude deleted profiles
    let sellerIdMatch = null;

    if (mongoose.Types.ObjectId.isValid(query)) {
      sellerIdMatch = await SellerProfile.findOne({
        sellerId: new mongoose.Types.ObjectId(query),
        status: { $in: ["Pending", "Completed"] },
      });
    }

    const sellerConditions = [
      { companyName: query, status: { $in: ["Pending", "Completed"] } },
      { emailId: query, status: { $in: ["Pending", "Completed"] } },
      { contactNo: query, status: { $in: ["Pending", "Completed"] } },
      { randomId: query, status: { $in: ["Pending", "Completed"] } },
    ];

    if (mongoose.Types.ObjectId.isValid(query)) {
      sellerConditions.push({
        sellerId: new mongoose.Types.ObjectId(query),
        status: { $in: ["Pending", "Completed"] },
      });
    }

    // Search for company name matches (only active profiles)
    const companyNameMatches = await SellerProfile.find({
      companyName: query,
      status: { $in: ["Pending", "Completed"] },
    }).populate("sellerId");

    if (companyNameMatches.length > 0) {
      if (companyNameMatches.length === 1) {
        const seller = companyNameMatches[0];
        results.push({
          type: "seller",
          id: seller._id,
          text: seller.companyName,
          exactMatchForCompanyName: true,
          isSingleMatch: true,
          sellerId: seller.sellerId?._id,
        });
      } else {
        results.push({
          type: "seller",
          text: query,
          exactMatchForCompanyName: true,
          isSingleMatch: false,
          matchCount: companyNameMatches.length,
        });
      }
    } else {
      // Search other seller conditions (only active profiles)
      const sellerMatches = await SellerProfile.find({ $or: sellerConditions });

      for (const seller of sellerMatches) {
        if (seller.sellerId && seller.sellerId.toString() === query) {
          results.push({
            type: "seller",
            id: seller._id,
            text: seller.sellerId.toString(),
            exactMatchForsellerId: true,
            isSingleMatch: true,
            sellerId: seller.sellerId,
          });
        }
        if (seller.emailId === query) {
          results.push({
            type: "seller",
            id: seller._id,
            sellerId: seller.sellerId,
            text: seller.emailId,
            exactMatchForSellerEmail: true,
            isSingleMatch: true,
          });
        }
        if (seller.contactNo === query) {
          results.push({
            type: "seller",
            id: seller._id,
            sellerId: seller.sellerId,
            text: seller.contactNo,
            exactMatchForSellerMobileNumber: true,
            isSingleMatch: true,
          });
        }
        if (seller.randomId === query) {
          results.push({
            type: "seller",
            id: seller._id,
            sellerId: seller.sellerId,
            text: seller.randomId,
            exactMatchForSellerRandomId: true,
            isSingleMatch: true,
          });
        }
      }
    }

    if (results.length > 0) {
      return res.json({ success: true, data: results });
    }

    return res.json({
      success: true,
      data: [
        {
          type: "noResults",
          text: "No matching records found",
        },
      ],
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during search",
      details: error.message,
    });
  }
}

export default get;
