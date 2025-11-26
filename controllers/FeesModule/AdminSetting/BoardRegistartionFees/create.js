
import BoardRegistrationFees from "../../../../models/FeesModule/BoardRegistrationFees.js";
import { BoardRegistrationFeesValidator } from "../../../../validators/FeesModule/BoardRegistartionFeeValidator.js";

export const createBoardRegistrationFees = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create Board Registration Fees.",
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

    const existingFees = await BoardRegistrationFees.findOne({ schoolId, classId, academicYear,sectionIds, });
    if (existingFees) {
      return res.status(409).json({
        hasError: true,
        message: "A board registration fee already exists for this class and section and  academic year.",
      });
    }

    const payload = { academicYear, classId, sectionIds, amount, schoolId };
    const created = await BoardRegistrationFees.create(payload);

    return res.status(201).json({
      hasError: false,
      message: "Board Registration Fees created successfully.",
      data: created,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      hasError: true,
      message: "Server error while creating Board Registration Fees.",
    });
  }
};

export default createBoardRegistrationFees;
