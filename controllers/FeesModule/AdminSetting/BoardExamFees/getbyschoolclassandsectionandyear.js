import BoardExamFees from "../../../../models/FeesModule/BoardExamFee.js";

export const getBoardExamFeesByFilter = async (req, res) => {
  try {
    const { schoolId, academicYear, classId, sectionId } = req.params;

    if (!schoolId || !academicYear || !classId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID, Academic Year, and Class ID are required.",
      });
    }

    const query = {
      schoolId,
      academicYear,
      classId,
    };

    if (sectionId && sectionId !== 'undefined') { 
      query.sectionIds = sectionId; 
    }

    const fees = await BoardExamFees.find(query);

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

export default getBoardExamFeesByFilter;
