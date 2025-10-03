// import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
// import ClassAndSection from "../../../models/FeesModule/Class&Section.js";

// const getAllClassSubjects = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         hasError: true,
//         message: "schoolId and academicYear are required",
//       });
//     }

//     const records = await ClassSubject.find({ schoolId, academicYear }).sort({
//       createdAt: -1,
//     });

//     return res.json({ hasError: false, data: records });
//   } catch (error) {
//     console.error("Error fetching class subjects:", error);
//     res.status(500).json({ hasError: true, message: "Internal server error" });
//   }
// };

// export default getAllClassSubjects;

import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";

const getAllClassSubjects = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    // Step 1: Fetch all class subjects
    const records = await ClassSubject.find({ schoolId, academicYear })
      .sort({ createdAt: -1 })
      .populate("classId", "className sections") // Populate classId to get className + sections array
      .lean(); // Convert to plain JS objects for easy manipulation

    // Step 2: Map sectionId to section name manually
    const formattedRecords = records.map((record) => {
      const classData = record.classId;
      let sectionName = null;

      if (classData && classData.sections?.length) {
        const matchedSection = classData.sections.find(
          (section) => section._id.toString() === record.sectionId.toString()
        );
        sectionName = matchedSection ? matchedSection.name : null;
      }

      return {
        ...record,
        className: classData?.className || null,
        sectionName,
      };
    });

    return res.json({ hasError: false, data: formattedRecords });
  } catch (error) {
    console.error("Error fetching class subjects:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default getAllClassSubjects;
