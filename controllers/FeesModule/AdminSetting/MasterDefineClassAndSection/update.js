import MasterDefineClass from "../../../../models/FeesModule/Class&Section.js";
import MasterDefineClassValidator from "../../../../validators/FeesModule/MasterDefineClass.js";

async function updateMasterDefineClass(req, res) {
  try {
    const { id } = req.params;

    const { error } =
      MasterDefineClassValidator.MasterDefineClassUpdate.validate(req.body);
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { masterDefineClassName } = req.body;

    const existingMasterDefineClass = await MasterDefineClass.findById(id);
    if (!existingMasterDefineClass) {
      return res.status(404).json({
        hasError: true,
        message: "Master Define Class not found.",
      });
    }

    const duplicateClass = await MasterDefineClass.findOne({
      masterDefineClassName,
    });
    if (duplicateClass && duplicateClass._id.toString() !== id) {
      return res.status(400).json({
        hasError: true,
        message: `Master Define Class with name "${masterDefineClassName}" already exists.`,
      });
    }

    existingMasterDefineClass.masterDefineClassName = masterDefineClassName;
    await existingMasterDefineClass.save();

    return res.status(200).json({
      hasError: false,
      message: "Master Define Class updated successfully.",
      data: existingMasterDefineClass,
    });
  } catch (error) {
    console.error("Error updating Master Define Class:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Master Define Class.",
      error: error.message,
    });
  }
}

export default updateMasterDefineClass;
