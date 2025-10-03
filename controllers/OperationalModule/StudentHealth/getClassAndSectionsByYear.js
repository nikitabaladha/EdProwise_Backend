import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
const getClassAndSectionsByYear = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId ) {
      return res.status(400).json({
        hasError: true,
        message: "School ID  are required in params.",
      });
    }

    if ( !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "Academic year are required in params.",
      });
    }

    const classes = await ClassAndSection.find({ schoolId, academicYear });

    if (!classes || classes.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No classes found for school ID ${schoolId} and academic year ${academicYear}.`,
      });
    }

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

export default getClassAndSectionsByYear;
