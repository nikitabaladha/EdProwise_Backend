import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

const deleteClassAndSection = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: No school ID found ",
      });
    }

    const classToDelete = await ClassAndSection.findOne({ _id: id, schoolId });

    if (!classToDelete) {
      return res.status(404).json({
        hasError: true,
        message: "Class not found or does not belong to your school.",
      });
    }

    await ClassAndSection.deleteOne({ _id: id });

    return res.status(200).json({
      hasError: false,
      message: "Class and sections deleted successfully.",
    });
  } catch (err) {
    console.error("Delete Class Error:", err);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete class and sections.",
      error: err.message,
    });
  }
};

export default deleteClassAndSection;
