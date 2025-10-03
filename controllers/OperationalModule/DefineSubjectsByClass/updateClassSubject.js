import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const updateSubject = async (req, res) => {
  try {
    const { parentId, subjectId } = req.params;
    const { subjectName } = req.body;

    if (!parentId || !subjectName) {
      return res.status(400).json({
        hasError: true,
        message: "parentId and subjectName are required",
      });
    }

    let updatedRecord;

    if (subjectId) {
      // ✅ Update existing subject
      updatedRecord = await ClassSubject.findOneAndUpdate(
        { _id: parentId, "subjects._id": subjectId },
        { $set: { "subjects.$.subjectName": subjectName } },
        { new: true }
      );

      if (!updatedRecord) {
        return res.status(404).json({
          hasError: true,
          message: "Subject not found for update",
        });
      }

      return res.json({
        hasError: false,
        message: "Subject updated successfully",
        data: updatedRecord,
      });
    } else {
      // ✅ Add a new subject
      updatedRecord = await ClassSubject.findByIdAndUpdate(
        parentId,
        { $push: { subjects: { subjectName } } },
        { new: true }
      );

      if (!updatedRecord) {
        return res.status(404).json({
          hasError: true,
          message: "Parent class not found to add subject",
        });
      }

      return res.json({
        hasError: false,
        message: "New subject added successfully",
        data: updatedRecord,
      });
    }
  } catch (error) {
    console.error("Error updating or adding subject:", error);
    res.status(500).json({
      hasError: true,
      message: "Internal server error",
    });
  }
};

export default updateSubject;
