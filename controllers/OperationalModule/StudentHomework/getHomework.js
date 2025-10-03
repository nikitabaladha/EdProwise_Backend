import StudentHomework from "../../../models/OperationalModule/StudentHomework.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const getHomework = async (req, res) => {
  try {
    const { schoolId, academicYear, className, sectionName, homeworkDate } =
      req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    // Build filter object
    const filter = { schoolId, academicYear };
    if (className) filter.className = className;
    if (sectionName) filter.sectionName = sectionName;

    // Add homeworkDate filter if provided
    if (homeworkDate) {
      // Convert to Date object and set to start of day for accurate comparison
      const targetDate = new Date(homeworkDate);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.homeworkDate = {
        $gte: targetDate,
        $lt: nextDay,
      };
    }

    // Get homework records
    const homeworkRecords = await StudentHomework.find(filter)
      .sort({ homeworkDate: -1, createdAt: -1 })
      .lean();

    // If no records found, return empty array
    if (!homeworkRecords.length) {
      return res.status(200).json({
        hasError: false,
        data: [],
        message: "No homework records found",
      });
    }

    // Get all unique subject IDs from all homework records
    const subjectIds = [];
    homeworkRecords.forEach((record) => {
      record.homeworkRows.forEach((row) => {
        if (row.subjectId && !subjectIds.includes(row.subjectId.toString())) {
          subjectIds.push(row.subjectId.toString());
        }
      });
    });

    // Fetch subject names if we have subject IDs
    let subjectMap = {};
    if (subjectIds.length > 0) {
      // Build query to find subjects
      const subjectQuery = {
        schoolId,
        academicYear,
        "subjects._id": { $in: subjectIds },
      };

      // If class/section is specified, add to query for more efficient lookup
      if (className) subjectQuery.class = className;
      if (sectionName) subjectQuery.section = sectionName;

      const classSubjectsData = await ClassSubject.find(subjectQuery).lean();

      // Build subject map
      classSubjectsData.forEach((classSubject) => {
        classSubject.subjects?.forEach((sub) => {
          subjectMap[sub._id.toString()] = sub.subjectName;
        });
      });
    }

    // Enrich homework records with subject names
    const enrichedHomeworkRecords = homeworkRecords.map((record) => ({
      ...record,
      homeworkRows: record.homeworkRows.map((row) => ({
        ...row,
        subjectName: subjectMap[row.subjectId?.toString()] || "Unknown Subject",
      })),
    }));

    return res.status(200).json({
      hasError: false,
      data: enrichedHomeworkRecords,
    });
  } catch (err) {
    console.error("Error fetching homework:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching homework records",
    });
  }
};

export default getHomework;
