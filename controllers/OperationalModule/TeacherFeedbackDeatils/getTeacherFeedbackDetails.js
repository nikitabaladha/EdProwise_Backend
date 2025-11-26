import mongoose from "mongoose";
import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import TeacherFeedback from "../../../models/StudentModels/TeacherFeedback.js";
// router.get("/teacher-feedback-summary", 
 const getTeacherFeedbackDetails = async (req, res) => {
  try {
    const { schoolId, academicYear, className, sectionName } = req.query;

    if (!schoolId || !academicYear || !className || !sectionName) {
      return res.status(400).json({
        success: false,
        message:
          "schoolId, academicYear, className, and sectionName are required",
      });
    }

    const timetable = await TimePeriod.findOne({
      schoolId: schoolId,
      academicYear: academicYear,
      className: className,
      sectionName: sectionName,
    });

    if (
      !timetable ||
      !timetable.timePeriodDetails ||
      timetable.timePeriodDetails.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for this class and section",
      });
    }

    // Create a map of subject IDs to staff IDs
    const subjectTeacherMap = {};
    const uniqueStaffIds = new Set();

    timetable.timePeriodDetails.forEach((detail) => {
      subjectTeacherMap[detail.subjectId.toString()] = detail.staffId;
      uniqueStaffIds.add(detail.staffId);
    });

    const classSubjects = await ClassSubject.findOne({
      schoolId: schoolId,
      academicYear: academicYear,
      class: className,
      section: sectionName,
    });

    if (
      !classSubjects ||
      !classSubjects.subjects ||
      classSubjects.subjects.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No subjects found for this class and section",
      });
    }

    // Get teacher details
    const teachers = await EmployeeRegistration.find({
      schoolId: schoolId,
      employeeId: { $in: Array.from(uniqueStaffIds) },
    });

    const teacherMap = {};
    teachers.forEach((teacher) => {
      teacherMap[teacher.employeeId] = teacher;
    });

    // Get feedback data for each teacher
    const teacherFeedbackSummary = [];

    for (const subject of classSubjects.subjects) {
      const subjectId = subject._id.toString();
      const staffId = subjectTeacherMap[subjectId];

      if (staffId) {
        const teacher = teacherMap[staffId];

        // Get feedback statistics for this teacher and subject
        const feedbackStats = await TeacherFeedback.aggregate([
          {
            $match: {
              schoolId: schoolId,
              academicYear: academicYear,
              subjectId: new mongoose.Types.ObjectId(subjectId),
              staffId: staffId,
            },
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$overallRating" },
              feedbackCount: { $sum: 1 },
            },
          },
        ]);

        teacherFeedbackSummary.push({
          subjectId: subjectId,
          subjectName: subject.subjectName,
          staffId: staffId,
          employeeId: staffId,
          teacherName: teacher ? teacher.employeeName : "Unknown",
          designation: teacher
            ? teacher.academicYearDetails[0]?.jobDesignation || "Teacher"
            : "Teacher",
          averageRating:
            feedbackStats.length > 0
              ? parseFloat(feedbackStats[0].averageRating.toFixed(2))
              : 0,
          feedbackCount:
            feedbackStats.length > 0 ? feedbackStats[0].feedbackCount : 0,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        className: className,
        sectionName: sectionName,
        academicYear: academicYear,
        teacherFeedbackSummary: teacherFeedbackSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher feedback summary:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getTeacherFeedbackDetails;
