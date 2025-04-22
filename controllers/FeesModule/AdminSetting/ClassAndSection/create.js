import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import ClassAndSectionValidator from "../../../../validators/FeesModule/ClassandSection.js";

const createClassAndSection = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create class and section.",
      });
    }

    const { error } = ClassAndSectionValidator.ClassAndSectionCreate.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { className, sections } = req.body;


    const existingClass = await ClassAndSection.findOne({ schoolId, className });
    if (existingClass) {
      return res.status(409).json({
        hasError: true,
        message: `Class '${className}' already exists.`,
      });
    }

    const newClass = new ClassAndSection({
      schoolId,
      className,
      sections,
    });

    await newClass.save();

    return res.status(201).json({
      hasError: false,
      message: "Class and sections created successfully.",
      data: newClass,
    });
  } catch (err) {
    console.error("Create Class Error:", err);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create class and sections.",
      error: err.message,
    });
  }
};

export default createClassAndSection;
