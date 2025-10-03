// import StudentHomework from "../../../models/OperationalModule/StudentHomework.js";
// const addHomework = async (req, res) => {
//   try {
//     const { schoolId, academicYear, className, sectionName } = req.body;

//     if (!schoolId || !academicYear || !className || !sectionName) {
//       return res.status(400).json({
//         hasError: true,
//         message:
//           "schoolId, academicYear, className, and sectionName are required",
//       });
//     }

//     // Build homeworkRows from req.body + req.files
//     const homeworkRows = [];

//     const rows = JSON.parse(req.body.rows || "[]"); 
//     rows.forEach((row, index) => {
//       const uploadedFile = req.files.find(
//         (f) => f.fieldname === `files[${index}]`
//       );
//       homeworkRows.push({
//         homeworkDate: row.homeworkDate,
//         subjectId: row.subjectId,
//         shortDescription: row.shortDescription,
//         remarks: row.remarks,
//         fileUrl: uploadedFile
//           ? `/Documents/HomeworkFiles/${uploadedFile.filename}`
//           : null,
//       });
//     });

//     if (homeworkRows.length === 0) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "No homework rows provided" });
//     }

//     // Save new homework entry
//     const newHomework = await StudentHomework.create({
//       schoolId,
//       academicYear,
//       className,
//       sectionName,
//       homeworkRows,
//     });

//     return res.status(201).json({
//       hasError: false,
//       message: "Homework created successfully",
//       data: newHomework,
//     });
//   } catch (error) {
//     console.error("Error in addHomework:", error);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// export default addHomework;

// import StudentHomework from "../../../models/OperationalModule/StudentHomework.js";

// const addOrUpdateHomework = async (req, res) => {
//   try {
//     const { schoolId, academicYear, className, sectionName } = req.body;
//     const rows = JSON.parse(req.body.rows || "[]");

//     if (!rows.length) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one homework row is required",
//       });
//     }

//     // Build homeworkRows array with file paths
//     const homeworkRows = rows.map((row, index) => {
//       const uploadedFile = req.files[index]; // multer stores files in order
//       return {
//         homeworkDate: row.homeworkDate,
//         subjectId: row.subjectId,
//         shortDescription: row.shortDescription,
//         remarks: row.remarks,
//         fileUrl: uploadedFile
//           ? `/Documents/HomeworkFiles/${uploadedFile.filename}`
//           : null,
//       };
//     });

//     let homeworkDoc = await StudentHomework.findOne({
//       schoolId,
//       academicYear,
//       className,
//       sectionName,
//     });

//     if (homeworkDoc) {
//       homeworkDoc.homeworkRows.push(...homeworkRows);
//       await homeworkDoc.save();

//       return res.status(200).json({
//         success: true,
//         message: "Homework added to existing record",
//         data: homeworkDoc,
//       });
//     } else {
//       const newDoc = await StudentHomework.create({
//         schoolId,
//         academicYear,
//         className,
//         sectionName,
//         homeworkRows,
//       });

//       return res.status(201).json({
//         success: true,
//         message: "Homework created successfully",
//         data: newDoc,
//       });
//     }
//   } catch (error) {
//     console.error("Error adding homework:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// export default addOrUpdateHomework;

import StudentHomework from "../../../models/OperationalModule/StudentHomework.js";

const addOrUpdateHomework = async (req, res) => {
  try {
    const { schoolId, academicYear, className, sectionName, homeworkDate } =
      req.body;
    const rows = JSON.parse(req.body.rows || "[]");

    if (!rows.length) {
      return res
        .status(400)
        .json({ success: false, message: "At least one row required" });
    }

    const homeworkRows = rows.map((row, index) => {
      const file = req.files?.[index];
      return {
        subjectId: row.subjectId,
        shortDescription: row.shortDescription,
        remarks: row.remarks,
        fileUrl: file ? `/Documents/HomeworkFiles/${file.filename}` : null,
      };
    });

    let homeworkDoc = await StudentHomework.findOne({
      schoolId,
      academicYear,
      className,
      sectionName,
      homeworkDate,
    });

    if (homeworkDoc) {
      homeworkDoc.homeworkRows.push(...homeworkRows);
      await homeworkDoc.save();

      return res.status(200).json({
        success: true,
        message: "Homework rows added to existing date",
        data: homeworkDoc,
      });
    }

    const newDoc = await StudentHomework.create({
      schoolId,
      academicYear,
      className,
      sectionName,
      homeworkDate,
      homeworkRows,
    });

    return res.status(201).json({
      success: true,
      message: "Homework created successfully",
      data: newDoc,
    });
  } catch (error) {
    console.error("Error adding homework:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export default addOrUpdateHomework;
