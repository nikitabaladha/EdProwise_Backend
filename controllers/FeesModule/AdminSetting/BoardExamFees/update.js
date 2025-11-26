import BoardExamFees from "../../../../models/FeesModule/BoardExamFee.js";
import { BoardExamFeesValidator } from "../../../../validators/FeesModule/BoardExamFeesValidator.js";

export const updateBoardExamFees = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to update Board Exam Fees.",
      });
    }

    const { error } = BoardExamFeesValidator.validate(req.body);
    if (error) {
      return res.status(400).json({
        hasError: true,
        message: error.details[0].message,
      });
    }

    const { academicYear, classId, sectionIds, amount } = req.body;

    const duplicate = await BoardExamFees.findOne({
      _id: { $ne: id },
      schoolId,
      classId,
      sectionIds,
      academicYear,
    });

    if (duplicate) {
      return res.status(409).json({
        hasError: true,
        message: "A board exam fee already exists for this class and section and academic year.",
      });
    }

    const updatedFees = await BoardExamFees.findOneAndUpdate(
      { _id: id, schoolId },
      { academicYear, classId, sectionIds, amount },
      { new: true }
    );

    if (!updatedFees) {
      return res.status(404).json({
        hasError: true,
        message: "Board Exam Fees not found or access denied.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Board Exam Fees updated successfully.",
      data: updatedFees,
    });
  } catch (err) {
    console.error("Error updating board exam fees:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while updating Board Exam Fees.",
    });
  }
};

export default updateBoardExamFees;
