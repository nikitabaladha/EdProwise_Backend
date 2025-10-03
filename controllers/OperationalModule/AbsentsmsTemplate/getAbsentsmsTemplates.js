import GreetingsmsTemplate from "../../../models/OperationalModule/GreetingsmsTemplate.js";
import AbsentsmsTemplate from "../../../models/OperationalModule/AbsentsmsTemplate.js";
const getAbsentsmsTemplates = async (req, res) => {
  try {
    const { schoolId, academicYear} = req.query;

    if (!schoolId || !academicYear ) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId, academicYear, and role are required",
      });
    }

    // Fetch templates
    const templates = await AbsentsmsTemplate.find({
      schoolId,
      academicYear,
      isActive: true,
    }).sort({ templateLabel: 1 });

    if (!templates || templates.length === 0) {
      return res.status(200).json({
        hasError: false,
        message: "No templates found",
        data: [],
      });
    }

    // Group templates by templateLabel
    const groupedTemplates = templates.reduce((acc, template) => {
      if (!acc[template.templateLabel]) {
        acc[template.templateLabel] = {
          templateLabel: template.templateLabel,
          templateValue: template.templateValue,
          templateTexts: [],
        };
      }
      //  acc[template.templateLabel]._ids.push(template._id); // store id

      // acc[template.templateLabel].templateTexts.push(...template.templateTexts);
      template.templateTexts.forEach((text) => {
        acc[template.templateLabel].templateTexts.push({
          _id: template._id,
          text,
        });
      });
      return acc;
    }, {});

    return res.status(200).json({
      hasError: false,
      message: "Greeting templates fetched successfully",
      data: Object.values(groupedTemplates),
    });
  } catch (error) {
    console.error("Error fetching greeting templates:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getAbsentsmsTemplates;
