
import AbsentsmsTemplate from "../../../models/OperationalModule/AbsentsmsTemplate.js";
const createAbsentsmsTemplate = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      templateLabel,
      templateValue,
      templateTexts,
    } = req.body;

if (!academicYear) {
  return res.status(400).json({
    hasError: true,
    message: "Academic Year is required",
  });
}

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required",
      });
    }

    

    if (!templateLabel) {
      return res.status(400).json({
        hasError: true,
        message: "Template Label is required",
      });
    }

    if (!templateValue) {
      return res.status(400).json({
        hasError: true,
        message: "Template Value is required",
      });
    }

    if (!templateTexts) {
      return res.status(400).json({
        hasError: true,
        message: "Template Texts is required",
      });
    }

    if (!Array.isArray(templateTexts)) {
      return res.status(400).json({
        hasError: true,
        message: "Template Texts must be an array",
      });
    }

    if (templateTexts.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "Template Texts cannot be empty",
      });
    }


    // const existing = await GreetingsmsTemplate.findOne({
    //   schoolId,
    //   academicYear,
    //   role,
    //   templateValue: templateValue.toLowerCase().trim(),
    // });

    // if (existing) {
    //   return res.status(409).json({
    //     hasError: true,
    //     message: "Template with this value already exists for this role",
    //   });
    // }

    const newTemplate = await AbsentsmsTemplate.create({
      schoolId,
      academicYear,
      templateLabel: templateLabel.trim(),
      templateValue: templateValue.toLowerCase().trim(),
      templateTexts,
    });

    return res.status(201).json({
      hasError: false,
      message: "Greeting template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    console.error("Error creating greeting template:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default createAbsentsmsTemplate;
