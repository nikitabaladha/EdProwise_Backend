import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import ClassAndSectionValidator from "../../../../validators/FeesModule/ClassandSection.js";

const updateClassAndSection = async (req, res) => {
  try {
    // Validate incoming request body
    const { error } = ClassAndSectionValidator.ClassAndSectionUpdate.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    // Get schoolId from user context
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to update class and section.",
      });
    }

    const { id } = req.params;
    const { className, sections } = req.body;

    // Check if the class exists
    const classData = await ClassAndSection.findOne({ _id: id, schoolId });
    if (!classData) {
      return res.status(404).json({
        hasError: true,
        message: "Class and section data not found.",
      });
    }

    // Check if a class with the same name exists (excluding current class)
    const existingClass = await ClassAndSection.findOne({
      className,
      schoolId,
      _id: { $ne: id },
    });

    if (existingClass) {
      return res.status(400).json({
        hasError: true,
        message: `Class with name '${className}' already exists.`,
      });
    }

    // Update class and sections
    classData.className = className;
    classData.sections = sections;

    await classData.save();

    return res.status(200).json({
      hasError: false,
      message: "Class and sections updated successfully.",
      data: classData,
    });
  } catch (err) {
    console.error("Update Class Error:", err);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update class and sections.",
      error: err.message,
    });
  }
};

export default updateClassAndSection;
