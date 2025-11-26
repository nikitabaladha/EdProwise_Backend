import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import createFeesStructureValidator from "../../../../validators/FeesModule/FeesStructure.js";

export const createFeesStructure = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create Fees Structure.",
      });
    }

    const { error, value } = createFeesStructureValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ hasError: true, message: error.message });
    }

    const { classId, sectionIds,academicYear } = value;


    const existingStructure = await FeesStructure.findOne({ schoolId, classId,academicYear,sectionIds });
    if (existingStructure) {
      return res.status(409).json({
        hasError: true,
        message: "A fees structure already exists for this class and section.",
      });
    }

    const payload = { ...value, schoolId };
    const created = await FeesStructure.create(payload);

    return res.status(201).json({
      hasError: false,
      message: "Fees structure created successfully.",
      data: created,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      hasError: true,
      message: "Server error while creating Fees Structure.",
    });
  }
};

export default createFeesStructure;