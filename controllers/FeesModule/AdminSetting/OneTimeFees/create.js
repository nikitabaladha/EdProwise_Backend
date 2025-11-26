import OneTimeFees from "../../../../models/FeesModule/OneTimeFees.js";
import createOneTimeFeesValidator from "../../../../validators/FeesModule/OneTimeFees.js";

export const createOneTimeFees = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create One Time Fees.",
      });
    }

    const { error, value } = createOneTimeFeesValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ hasError: true, message: error.message });
    }

    const { classId, sectionIds, oneTimeFees, academicYear } = value;


    for (let fee of oneTimeFees) {
      const { feesTypeId } = fee;

      const existingOneTimeFees = await OneTimeFees.findOne({
        schoolId,
        academicYear,
        classId,
        sectionIds: { $in: sectionIds }, 
        'oneTimeFees.feesTypeId': feesTypeId, 
      });

      if (existingOneTimeFees) {
        return res.status(409).json({
          hasError: true,
          message: `One-time fee already exists for this class and sections.`,
        });
      }
    }

 
    const payload = { ...value, schoolId };

 
    const created = await OneTimeFees.create(payload);

    return res.status(201).json({
      hasError: false,
      message: "One-time fees structure created successfully.",
      data: created,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      hasError: true,
      message: "Server error while creating One-Time Fees Structure.",
    });
  }
};

export default createOneTimeFees;
