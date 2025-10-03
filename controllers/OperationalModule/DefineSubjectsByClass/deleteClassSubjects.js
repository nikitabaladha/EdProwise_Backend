import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
const deleteClassSectionSubjects = async (req, res) => {
  try {
    const { parentId } = req.params;
    const record = await ClassSubject.findByIdAndDelete(parentId);

    if (!record)
      return res
        .status(404)
        .json({ hasError: true, message: "Class/Section not found" });

    return res.json({
      hasError: false,
      message: "Class/Section subjects deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class section:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};
export default deleteClassSectionSubjects;