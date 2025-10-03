// import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
// import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
// const getSubjects = async (req, res) => {
//   try {
//     const { schoolId, academicYear, classId, sectionId} = req.query;

//     if (!schoolId || !academicYear) {
//       return res
//         .status(400)
//         .json({
//           hasError: true,
//           message: "schoolId and academicYear are required",
//         });
//     }

//     let query = { schoolId, academicYear };
//     if (className) query.class = className;
//     if (sectionName) query.section = sectionName;

//     const records = await ClassSubject.find(query);
//     return res.json({ hasError: false, data: records });
//   } catch (error) {
//     console.error("Error fetching subjects:", error);
//     res.status(500).json({ hasError: true, message: "Internal server error" });
//   }
// };

// export default getSubjects;

import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";

const getSubjects = async (req, res) => {
  try {
    const { schoolId, academicYear, classId, sectionId } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    // Build query based on available filters
    let query = { schoolId, academicYear };
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    // Fetch subjects with populated class information
    const records = await ClassSubject.find(query)
      .populate("classId", "className sections")
      .sort({ createdAt: -1 })
      .lean();

    // Attach section name manually
    const formattedRecords = records.map((record) => {
      let sectionName = null;
      if (record.classId?.sections?.length) {
        const matchedSection = record.classId.sections.find(
          (section) => section._id.toString() === record.sectionId.toString()
        );
        sectionName = matchedSection ? matchedSection.name : null;
      }

      return {
        ...record,
        className: record.classId?.className || null,
        sectionName,
      };
    });

    return res.json({ hasError: false, data: formattedRecords });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default getSubjects;
