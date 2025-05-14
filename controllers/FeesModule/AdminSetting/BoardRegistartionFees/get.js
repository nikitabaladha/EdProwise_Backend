import BoardRegistrationFees from "../../../../models/FeesModule/BoardRegistrationFees.js";

export const getBoardRegistrationFeesBySchoolId = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "Both School ID and Academic Year are required.",
      });
    }

    const fees = await BoardRegistrationFees.find({ schoolId, academicYear });

    return res.status(200).json({
      hasError: false,
      message: "Board Registration Fees fetched successfully.",
      data: fees,
    });
  } catch (err) {
    console.error("Error fetching board registration fees:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching Board Registration Fees.",
    });
  }
};

export default getBoardRegistrationFeesBySchoolId;