import QuoteRequest from "../../models/QuoteRequest.js";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";
import School from "../../models/School.js";
import SellerProfile from "../../models/SellerProfile.js";
import mongoose from "mongoose";

async function get(req, res) {
  const { query } = req.query;

  try {
    // Initialize results array
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

    // 2. Search Schools
    const schoolConditions = [
      { schoolId: query },
      { schoolName: query },
      { schoolEmail: query },
      { schoolMobileNo: query },
    ];

    const schoolMatch = await School.findOne({ $or: schoolConditions });
    if (schoolMatch) {
      if (schoolMatch.schoolId === query) {
        results.push({
          type: "school",
          id: schoolMatch._id,
          text: schoolMatch.schoolId,
          exactMatchForSchoolId: true,
        });
      }
      if (schoolMatch.schoolName === query) {
        results.push({
          type: "school",
          id: schoolMatch._id,
          text: schoolMatch.schoolName,
          exactMatchForSchoolName: true,
        });
      }
      if (schoolMatch.schoolEmail === query) {
        results.push({
          type: "school",
          id: schoolMatch._id,
          text: schoolMatch.schoolEmail,
          exactMatchForSchoolEmail: true,
        });
      }
      if (schoolMatch.schoolMobileNo === query) {
        results.push({
          type: "school",
          id: schoolMatch._id,
          text: schoolMatch.schoolMobileNo,
          exactMatchForSchoolMobileNumber: true,
        });
      }
    }

    // 3. Search Sellers - Fixed sellerId comparison
    let sellerIdMatch = null;

    // Check if query is a valid ObjectId before searching
    if (mongoose.Types.ObjectId.isValid(query)) {
      sellerIdMatch = await SellerProfile.findOne({
        sellerId: new mongoose.Types.ObjectId(query),
      });
    }

    const sellerConditions = [
      { companyName: query },
      { emailId: query },
      { contactNo: query },
      { randomId: query },
    ];

    // Only add sellerId condition if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(query)) {
      sellerConditions.push({ sellerId: new mongoose.Types.ObjectId(query) });
    }

    const sellerMatches = await SellerProfile.find({ $or: sellerConditions });

    // Process seller matches
    for (const seller of sellerMatches) {
      if (seller.sellerId && seller.sellerId.toString() === query) {
        results.push({
          type: "seller",
          id: seller._id,
          text: seller.sellerId.toString(),
          exactMatchForsellerId: true,
        });
      }
      if (seller.companyName === query) {
        results.push({
          type: "seller",
          id: seller._id,
          sellerId: seller.sellerId,
          text: seller.companyName,
          exactMatchForCompanyName: true,
        });
      }
      if (seller.emailId === query) {
        results.push({
          type: "seller",
          id: seller._id,
          sellerId: seller.sellerId,
          text: seller.emailId,
          exactMatchForSellerEmail: true,
        });
      }
      if (seller.contactNo === query) {
        results.push({
          type: "seller",
          id: seller._id,
          sellerId: seller.sellerId,
          text: seller.contactNo,
          exactMatchForSellerMobileNumber: true,
        });
      }
      if (seller.randomId === query) {
        results.push({
          type: "seller",
          id: seller._id,
          sellerId: seller.sellerId,
          text: seller.randomId,
          exactMatchForSellerRandomId: true,
        });
      }
    }

    // Return results
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
