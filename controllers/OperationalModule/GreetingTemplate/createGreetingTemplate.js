
import GreetingsmsTemplate from "../../../models/OperationalModule/GreetingsmsTemplate.js";

const createGreetingTemplate = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      role,
      templateLabel,
      templateValue,
      templateTexts,
    } = req.body;

    if (
      !schoolId ||
      !academicYear ||
      !role ||
      !templateLabel ||
      !templateValue ||
      !templateTexts ||
      !Array.isArray(templateTexts) ||
      templateTexts.length === 0
    ) {
      return res.status(400).json({
        hasError: true,
        message: "All required fields must be provided",
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

    const newTemplate = await GreetingsmsTemplate.create({
      schoolId,
      academicYear,
      role,
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

export default createGreetingTemplate;
