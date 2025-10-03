import EntranceExamSubject from "../../../models/OperationalModule/EntranceExamSubject.js";

const deleteEntranceExamSubject = async (req, res) => {
  try {
    const { parentId, subjectId } = req.params;

    const record = await EntranceExamSubject.findByIdAndUpdate(
      parentId,
      { $pull: { subjects: { _id: subjectId } } },
      { new: true }
    );

    if (!record)
      return res
        .status(404)
        .json({ hasError: true, message: "Subject not found" });

    return res.json({
      hasError: false,
      message: "Subject deleted successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};
export default deleteEntranceExamSubject;