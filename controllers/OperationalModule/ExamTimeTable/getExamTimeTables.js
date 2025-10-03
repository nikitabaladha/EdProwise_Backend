// import ExamTimeTable from "../../../models/OperationalModule/ExamTimeTable.js";
// const getExamTimeTables = async (req, res) => {
//   try {
//     const { schoolId, academicYear, className, sectionName } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         hasError: true,
//         message: "schoolId and academicYear are required",
//       });
//     }

//     const filter = { schoolId, academicYear };

//     if (className) filter.className = className;
//     if (sectionName) filter.sectionName = sectionName;

//     const timetables = await ExamTimeTable.find(filter)
//       .sort({ createdAt: -1 })
//       .populate("examDetails.subjectId", "subjectName");

//     return res.status(200).json({
//       hasError: false,
//       data: timetables,
//     });
//   } catch (err) {
//     console.error("Error fetching exam timetables:", err);
//     return res.status(500).json({
//       hasError: true,
//       message: "Server error while fetching exam timetables",
//     });
//   }
// };
// export default getExamTimeTables;

// import ExamTimeTable from "../../../models/OperationalModule/ExamTimeTable.js";
// import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

// const getExamTimeTables = async (req, res) => {
//   try {
//     const { schoolId, academicYear, className, sectionName } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         hasError: true,
//         message: "schoolId and academicYear are required",
//       });
//     }

//     const filter = { schoolId, academicYear };
//     if (className) filter.className = className;
//     if (sectionName) filter.sectionName = sectionName;

//     const timetables = await ExamTimeTable.find(filter)
//       .sort({ createdAt: -1 })
//       .lean();

//     const classSubjects = await ClassSubject.findOne({
//       schoolId,
//       academicYear,
//       class: className,
//       section: sectionName,
//     }).lean();

//     const subjectMap = {};
//     classSubjects?.subjects?.forEach((sub) => {
//       subjectMap[sub._id.toString()] = sub.subjectName;
//     });

//     const enrichedTimetables = timetables.map((t) => ({
//       ...t,
//       examDetails: t.examDetails.map((d) => ({
//         ...d,
//         subjectName: subjectMap[d.subjectId?.toString()] || "",
//       })),
//     }));

//     return res.status(200).json({
//       hasError: false,
//       data: enrichedTimetables,
//     });
//   } catch (err) {
//     console.error("Error fetching exam timetables:", err);
//     return res.status(500).json({
//       hasError: true,
//       message: "Server error while fetching exam timetables",
//     });
//   }
// };

// export default getExamTimeTables;

import ExamTimeTable from "../../../models/OperationalModule/ExamTimeTable.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const getExamTimeTables = async (req, res) => {
  try {
    const { schoolId, academicYear, className, sectionName } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    const filter = { schoolId, academicYear };
    if (className) filter.className = className;
    if (sectionName) filter.sectionName = sectionName;

    // Get timetables
    const timetables = await ExamTimeTable.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Fetch class subjects - either for a specific class/section OR all for the school
    const subjectQuery = { schoolId, academicYear };
    if (className) subjectQuery.class = className;
    if (sectionName) subjectQuery.section = sectionName;

    const classSubjectsData = await ClassSubject.find(subjectQuery).lean();

    // Build subject map
    const subjectMap = {};
    classSubjectsData.forEach((classSubject) => {
      classSubject.subjects?.forEach((sub) => {
        subjectMap[sub._id.toString()] = sub.subjectName;
      });
    });

    // Attach subjectName to each timetable's examDetails
    const enrichedTimetables = timetables.map((t) => ({
      ...t,
      examDetails: t.examDetails.map((d) => ({
        ...d,
        subjectName: subjectMap[d.subjectId?.toString()] || "",
      })),
    }));

    return res.status(200).json({
      hasError: false,
      data: enrichedTimetables,
    });
  } catch (err) {
    console.error("Error fetching exam timetables:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching exam timetables",
    });
  }
};

export default getExamTimeTables;
