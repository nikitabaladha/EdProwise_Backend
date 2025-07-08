import FeesType from "../../../../models/FeesModule/FeesType.js";
import FeesTypeValidator from "../../../../validators/FeesModule/FeesType.js";

async function create(req, res) {
  try {
    const { error } = FeesTypeValidator.FeesTypeCreate.validate(req.body);
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create Fees Type.",
      });
    }

    const { feesTypeName, groupOfFees, academicYear } = req.body;

    const existingFeesType = await FeesType.findOne({ 
      feesTypeName, 
      schoolId,
      academicYear 
    });
    if (existingFeesType) {
      return res.status(400).json({
        hasError: true,
        message: `Fees Type with name "${feesTypeName}" already exists for academic year ${academicYear} in this school.`,
      });
    }

    const feesType = new FeesType({
      schoolId,
      feesTypeName,
      groupOfFees,
      academicYear,
    });

    await feesType.save();

    return res.status(201).json({
      hasError: false,
      message: "Fees Type created successfully.",
      data: feesType,
    });
  } catch (error) {
    console.error("Error creating Fees Type:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: `Fees Type with name "${req.body.feesTypeName}" already exists for academic year ${req.body.academicYear} in this school.`,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Fees Type.",
      error: error.message,
    });
  }
}

export default create;