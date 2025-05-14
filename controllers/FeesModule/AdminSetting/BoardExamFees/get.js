import BoardExamFees from "../../../../models/FeesModule/BoardExamFee.js";

export const getBoardExamFeesBySchoolId = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "Both School ID and Academic Year are required.",
      });
    }

    const fees = await BoardExamFees.find({ schoolId, academicYear });

    return res.status(200).json({
      hasError: false,
      message: "Board Exam Fees fetched successfully.",
      data: fees,
    });
  } catch (err) {
    console.error("Error fetching board exam fees:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching Board Exam Fees.",
    });
  }
};

export default getBoardExamFeesBySchoolId;
