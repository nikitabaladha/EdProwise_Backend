import StudentHomework from "../../../models/OperationalModule/StudentHomework.js";
import fs from "fs";

const updateHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = JSON.parse(req.body.rows || "[]");

    if (!rows.length) {
      return res
        .status(400)
        .json({ success: false, message: "At least one row is required" });
    }

    // Find existing document
    let homeworkDoc = await StudentHomework.findById(id);
    if (!homeworkDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Homework document not found" });
    }

    // Prepare updated rows
    const updatedRows = rows.map((row, index) => {
      const file = req.files?.[index];

      return {
        subjectId: row.subjectId,
        shortDescription: row.shortDescription,
        remarks: row.remarks,
        fileUrl: file
          ? `/Documents/HomeworkFiles/${file.filename}` // New upload
          : row.fileUrl || null, // Keep old file if not replaced
      };
    });

    // Optional: delete removed files from disk
    const oldFiles = homeworkDoc.homeworkRows.map((r) => r.fileUrl);
    const newFiles = updatedRows.map((r) => r.fileUrl);
    const filesToDelete = oldFiles.filter(
      (oldFile) => oldFile && !newFiles.includes(oldFile)
    );
    filesToDelete.forEach((filePath) => {
      const fullPath = `.${filePath}`;
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    // Replace rows & save
    homeworkDoc.homeworkRows = updatedRows;
    await homeworkDoc.save();

    return res.status(200).json({
      success: true,
      message: "Homework updated successfully",
      data: homeworkDoc,
    });
  } catch (error) {
    console.error("Error updating homework:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export default updateHomework;
