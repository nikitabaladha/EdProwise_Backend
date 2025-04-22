import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

const getClassAndSections = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "Missing school ID in parameters.",
      });
    }

    const classes = await ClassAndSection.find({ schoolId });

    return res.status(200).json({
      hasError: false,
      message: "Classes and sections fetched successfully.",
      data: classes,
    });
  } catch (err) {
    console.error("Fetch Class Error:", err);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch class and section data.",
      error: err.message,
    });
  }
};

export default getClassAndSections;
