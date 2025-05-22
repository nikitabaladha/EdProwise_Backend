import BoardRegistrationFees from "../../../../models/FeesModule/BoardRegistrationFees.js";
import { BoardRegistrationFeesValidator } from "../../../../validators/FeesModule/BoardRegistartionFeeValidator.js";

export const updateBoardRegistrationFees = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to update Board Registration Fees.",
      });
    }

 

 
    const { error } = BoardRegistrationFeesValidator.validate(req.body);
    if (error) {
      return res.status(400).json({
        hasError: true,
        message: error.details[0].message,
      });
    }

    const { academicYear, classId, sectionIds, amount } = req.body;

    const duplicate = await BoardRegistrationFees.findOne({
      _id: { $ne: id },
      schoolId,
      classId,
      sectionIds,
      academicYear,
    });

    if (duplicate) {
      return res.status(409).json({
        hasError: true,
        message: "A board registration fee already exists for this class and academic year.",
      });
    }

    const updatedFees = await BoardRegistrationFees.findOneAndUpdate(
      { _id: id, schoolId },
      { academicYear, classId, sectionIds, amount },
      { new: true }
    );

    if (!updatedFees) {
      return res.status(404).json({
        hasError: true,
        message: "Board Registration Fees not found or access denied.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Board Registration Fees updated successfully.",
      data: updatedFees,
    });
  } catch (err) {
    console.error("Error updating board registration fees:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while updating Board Registration Fees.",
    });
  }
};

export default updateBoardRegistrationFees;
