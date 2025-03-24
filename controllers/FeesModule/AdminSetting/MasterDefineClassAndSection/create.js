import MasterDefineClass from "../../../../models/FeesModule/Class&Section.js";
import MasterDefineClassValidator from "../../../../validators/FeesModule/MasterDefineClass.js";

async function create(req, res) {
  try {
    const { error } =
      MasterDefineClassValidator.MasterDefineClassCreate.validate(req.body);
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { masterDefineClassName } = req.body;

    const existingMasterDefineClass = await MasterDefineClass.findOne({
      masterDefineClassName,
    });
    if (existingMasterDefineClass) {
      return res.status(400).json({
        hasError: true,
        message: `Master Define Class with name "${masterDefineClassName}" already exists.`,
      });
    }

    const masterDefineClass = new MasterDefineClass({ masterDefineClassName });
    await masterDefineClass.save();

    return res.status(201).json({
      hasError: false,
      message: "Master Define Class created successfully",
      data: masterDefineClass,
    });
  } catch (error) {
    console.error("Error creating Master Define Class:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Master Define Class.",
      error: error.message,
    });
  }
}

export default create;
