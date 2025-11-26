import OvertimeAllowanceRate from "../../../../models/PayrollModule/AdminSettings/OvertimeAllowanceRate.js";

const getOvertimeRate = async (req, res) => {
  try {
    const { schoolId, academicYear, category, grade } = req.query;

    if (!schoolId || !academicYear || !category || !grade) {
      return res.status(400).json({
        hasError: true,
        message: "Missing required query parameters.",
      });
    }

    const rateDoc = await OvertimeAllowanceRate.findOne({
      schoolId,
      academicYear,
      category,
      grade,
    });

    if (!rateDoc) {
      return res.status(404).json({
        hasError: true,
        message: "Overtime rate not found for the provided details.",
      });
    }

    return res.status(200).json({
      hasError: false,
      rate: rateDoc.rate,
    });
  } catch (error) {
    console.error("Error fetching overtime rate:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching overtime rate.",
    });
  }
};
export default getOvertimeRate;