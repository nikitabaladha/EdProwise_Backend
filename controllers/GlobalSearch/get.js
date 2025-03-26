import QuoteRequest from "../../models/QuoteRequest.js";
import School from "../../models/School.js";
import SellerProfile from "../../models/SellerProfile.js";

async function get(req, res) {
  const { query } = req.query;

  try {
    const exactMatchForEnquiryNumber = await QuoteRequest.findOne({
      enquiryNumber: query,
    });

    const exactMatchForSchoolId = await School.findOne({ schoolId: query });

    const exactMatchForSchoolName = await School.findOne({ schoolName: query });

    const exactMatchForSchoolEmail = await School.findOne({
      schoolEmail: query,
    });

    const results = [];

    if (exactMatchForEnquiryNumber) {
      results.push({
        type: "quoteRequest",
        id: exactMatchForEnquiryNumber._id,
        text: exactMatchForEnquiryNumber.enquiryNumber,
        exactMatchForEnquiryNumber: true,
      });
    }

    if (exactMatchForSchoolId) {
      results.push({
        type: "school",
        id: exactMatchForSchoolId._id,
        text: exactMatchForSchoolId.schoolId,
        exactMatchForSchoolId: true,
      });
    }

    if (exactMatchForSchoolEmail) {
      results.push({
        type: "school",
        id: exactMatchForSchoolEmail._id,
        schoolId: exactMatchForSchoolEmail.schoolId,
        text: exactMatchForSchoolEmail.schoolEmail,
        exactMatchForSchoolEmail: true,
      });
    }

    if (exactMatchForSchoolName) {
      results.push({
        type: "school",
        id: exactMatchForSchoolName._id,
        schoolId: exactMatchForSchoolName.schoolId,
        text: exactMatchForSchoolName.schoolName,
        exactMatchForSchoolName: true,
      });
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export default get;
