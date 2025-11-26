import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import TeacherFeedback from "../../../models/StudentModels/TeacherFeedback.js";

const getTeacherFeedback =  async (req, res) => {
  try {
    const { admissionNumber, schoolId, academicYear } = req.query;

    // Validate required parameters
    if (!admissionNumber || !schoolId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "admissionNumber, schoolId, and academicYear are required",
      });
    }

    const student = await AdmissionForm.findOne({
      AdmissionNumber: admissionNumber,
      schoolId: schoolId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const currentAcademicYear = student.academicHistory.find(
      (entry) => entry.academicYear === academicYear
    );

    if (!currentAcademicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found for this student",
      });
    }

    // Get class and section details
    const classSection = await ClassAndSection.findOne({
      _id: currentAcademicYear.masterDefineClass,
      "sections._id": currentAcademicYear.section,
      schoolId: schoolId,
      academicYear: academicYear,
    });

    if (!classSection) {
      return res.status(404).json({
        success: false,
        message: "Class and section details not found",
      });
    }

    // Find the section name
    const section = classSection.sections.id(currentAcademicYear.section);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const className = classSection.className;
    const sectionName = section.name;

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

    const subjectTeacherMap = {};
    timetable.timePeriodDetails.forEach((detail) => {
      subjectTeacherMap[detail.subjectId.toString()] = detail.staffId;
    });

    const teacherFeedbackStatus = [];

    for (const subject of classSubjects.subjects) {
      const subjectId = subject._id.toString();
      const staffId = subjectTeacherMap[subjectId];

      if (staffId) {
        const teacher = await EmployeeRegistration.findOne({
          schoolId: schoolId,
          employeeId: staffId,
        });

        const existingFeedback = await TeacherFeedback.findOne({
          schoolId: schoolId,
          academicYear: academicYear,
          admissionNumber: admissionNumber,
          subjectId: subjectId,
          staffId: staffId,
        });

        teacherFeedbackStatus.push({
          subjectId: subjectId,
          subjectName: subject.subjectName,
          staffId: staffId,
          teacherName: teacher ? teacher.employeeName : "Unknown",
          feedbackStatus: existingFeedback
            ? existingFeedback.status
            : "Pending",
        });
      } else {
        teacherFeedbackStatus.push({
          subjectId: subjectId,
          subjectName: subject.subjectName,
          staffId: null,
          teacherName: "Not assigned",
          feedbackStatus: "N/A",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          admissionNumber: student.AdmissionNumber,
          name: `${student.firstName} ${student.lastName}`,
          class: className,
          section: sectionName,
          academicYear: academicYear,
        },
        teacherFeedbackStatus: teacherFeedbackStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher feedback status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getTeacherFeedback

