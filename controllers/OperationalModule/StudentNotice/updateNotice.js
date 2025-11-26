// import StudentNotice from "../../../models/OperationalModule/StudentNotice.js";
// import fs from "fs";

// const updateNotice = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { noticeDate, subject, shortDescription } = req.body;

//     const notice = await StudentNotice.findById(id);
//     if (!notice) {
//       return res.status(404).json({ message: "Notice not found" });
//     }

//     // Update fields
//     if (noticeDate) notice.noticeDate = noticeDate;
//     if (subject) notice.subject = subject;
//     if (shortDescription) notice.shortDescription = shortDescription;

//     // If a new file is uploaded, replace old one
//     if (req.file) {
//       // Delete old file if exists
//       if (notice.fileUrl && fs.existsSync(notice.fileUrl)) {
//         fs.unlinkSync(notice.fileUrl);
//       }
//       notice.fileUrl = req.file.path;
//     }

//     await notice.save();

//     res.status(200).json({ message: "Notice updated successfully", notice });
//   } catch (error) {
//     console.error("Error updating notice:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// export default updateNotice;

import StudentNotice from "../../../models/OperationalModule/StudentNotice.js";
import fs from "fs";

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { noticeDate, subject, shortDescription } = req.body;

    // ✅ Validation errors
    let hasError = false;
    const errors = {};

    if (!subject || subject.trim() === "") {
      errors.subject = "Subject (Title) is required.";
      hasError = true;
    }

    if (!noticeDate || noticeDate.trim() === "") {
      errors.noticeDate = "Notice date is required.";
      hasError = true;
    }

    if (!shortDescription || shortDescription.trim() === "") {
      errors.shortDescription = "Short description is required.";
      hasError = true;
    }

    if (hasError) {
      return res.status(400).json({
        message: "Validation failed",
        hasError: true,
        errors,
      });
    }

    const notice = await StudentNotice.findById(id);
    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
        hasError: true,
        errors: { id: "Invalid Notice ID" },
      });
    }

    // ✅ Update fields
    notice.noticeDate = noticeDate;
    notice.subject = subject;
    notice.shortDescription = shortDescription;

    // ✅ Replace file if new one is uploaded
    if (req.file) {
      if (notice.fileUrl && fs.existsSync(notice.fileUrl)) {
        fs.unlinkSync(notice.fileUrl);
      }
      notice.fileUrl = req.file.path;
    }

    await notice.save();

    return res.status(200).json({
      message: "Notice updated successfully",
      hasError: false,
      notice,
    });
  } catch (error) {
    console.error("Error updating notice:", error);
    return res.status(500).json({
      message: "Server Error",
      hasError: true,
      errors: { server: error.message },
    });
  }
};

export default updateNotice;
