import StudentHomework from "../../../models/OperationalModule/StudentHomework.js";
import fs from "fs";

const deleteHomework = async (req, res) => {
  try {
    const { id } = req.params; // Parent homework document ID

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Homework document ID is required",
      });
    }

    const homeworkDoc = await StudentHomework.findById(id);
    if (!homeworkDoc) {
      return res.status(404).json({
        success: false,
        message: "Homework document not found",
      });
    }

    // Optional: Delete all files from disk
    homeworkDoc.homeworkRows.forEach((row) => {
      if (row.fileUrl) {
        const filePath = `.${row.fileUrl}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    // Delete the document
    await StudentHomework.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Homework deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting homework:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting homework",
      error: error.message,
    });
  }
};

export default deleteHomework;
