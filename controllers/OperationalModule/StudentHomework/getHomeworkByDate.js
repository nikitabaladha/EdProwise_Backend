import StudentHomework from "../../../models/OperationalModule/StudentHomework.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const getHomeworkByDate = async (req, res) => {
  try {
    const { schoolId, academicYear, className, sectionName, date } = req.query;

    if (!schoolId || !academicYear || !date) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId, academicYear, and date are required",
      });
    }
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const filter = {
      schoolId,
      academicYear,
      homeworkDate: { $gte: startDate, $lte: endDate },
    };
    if (className) filter.className = className;
    if (sectionName) filter.sectionName = sectionName;

    const homeworkDocs = await StudentHomework.find(filter).lean();

    if (!homeworkDocs.length) {
      return res.status(200).json({
        hasError: false,
        data: [],
        message: "No homework found for this date",
      });
    }

    // Fetch class subjects for this class/section
    const subjectQuery = { schoolId, academicYear };
    if (className) subjectQuery.class = className;
    if (sectionName) subjectQuery.section = sectionName;

    const classSubjects = await ClassSubject.find(subjectQuery).lean();

    // Build subject map
    const subjectMap = {};
    classSubjects.forEach((classSubject) => {
      classSubject.subjects?.forEach((sub) => {
        subjectMap[sub._id.toString()] = sub.subjectName;
      });
    });

    // Enrich homeworkRows with subjectName
    const enrichedHomework = homeworkDocs.map((doc) => ({
      ...doc,
      homeworkRows: doc.homeworkRows.map((row) => ({
        ...row,
        subjectName: subjectMap[row.subjectId?.toString()] || "",
      })),
    }));

    return res.status(200).json({
      hasError: false,
      data: enrichedHomework,
    });
  } catch (err) {
    console.error("Error fetching homework by date:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching homework",
    });
  }
};

export default getHomeworkByDate;
