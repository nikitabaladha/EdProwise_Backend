import QuoteRequest from "../../models/QuoteRequest.js";
import School from "../../models/School.js";

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

    const results = exactMatchForEnquiryNumber
      ? [
          {
            type: "quoteRequest",
            id: exactMatchForEnquiryNumber._id,
            text: exactMatchForEnquiryNumber.enquiryNumber,
            exactMatchForEnquiryNumber: true,
          },
        ]
      : [];

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export default get;
