
// Original 
// import StudentAttendance from "../../../models/OperationalModule/StudentAttendance.js";
// import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";
// const getStudentAttendanceforSchool = async (req, res) => {
//   try {
//     const { schoolId, academicYear, date } = req.query;

//     if (!schoolId || !academicYear || !date) {
//       return res.status(400).json({
//         message: "schoolId, academicYear and date are required",
//       });
//     }
    
//     const targetDate = new Date(date);

//     const records = await StudentAttendance.find({
//       schoolId,
//       academicYear,
//       "attendanceDetails.attendanceDate": targetDate,
//     });

//     const classSectionMap = {};
//     records.forEach((rec) => {
//       const key = `${rec.class}-${rec.section}`;
//       if (!classSectionMap[key]) {
//         classSectionMap[key] = {
//           schoolId: rec.schoolId,
//           academicYear: rec.academicYear,
//           class: rec.class,
//           section: rec.section,
//           students: [],
//         };
//       }

//       const attendanceForDate = rec.attendanceDetails.find(
//         (a) =>
//           new Date(a.attendanceDate).toDateString() ===
//           targetDate.toDateString()
//       );

//       classSectionMap[key].students.push({
//         admissionNumber: rec.admissionNumber,
//         rollNo: rec.rollNo,
//         studentName: rec.studentName,
//         status: attendanceForDate ? attendanceForDate.status : "Not Marked",
//       });
//     });

//     const formatted = Object.values(classSectionMap);

//     return res.status(200).json({ data: formatted });
//   } catch (error) {
//     console.error("Error fetching student attendance:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// export default getStudentAttendanceforSchool;

import StudentAttendance from "../../../models/OperationalModule/StudentAttendance.js";
import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
import StudentRollNumber from "../../../models/OperationalModule/StudentRollNumber.js";

const getStudentAttendanceforSchool = async (req, res) => {
  try {
    const { schoolId, academicYear, date } = req.query;

    if (!schoolId || !academicYear || !date) {
      return res.status(400).json({
        message: "schoolId, academicYear and date are required",
      });
    }

    const targetDate = new Date(date);
    const targetDateStr = targetDate.toDateString();

    const isSunday = targetDate.getDay() === 0;

    let isOperationalHoliday = false;
    
    if (!isSunday) {
      const holidayRecord = await OperationalSchoolHoliday.findOne({
        schoolId,
        academicYear,
        "holidayDetails.holidayDate": targetDate,
      });

      if (holidayRecord) {
        const matchedHoliday = holidayRecord.holidayDetails.find(
          (h) => new Date(h.holidayDate).toDateString() === targetDateStr
        );
        if (matchedHoliday) isOperationalHoliday = true;
      }
    }

    if (isSunday || isOperationalHoliday) {
      console.log("isOperationalHoliday", isOperationalHoliday);
      
      const students = await AdmissionForm.find({ schoolId, academicYear });

      for (const student of students) {
        const currentYearData = student.academicHistory.find(
          (entry) => entry.academicYear === academicYear
        );
        if (!currentYearData) continue;

        const classDoc = await ClassAndSection.findById(
          currentYearData.masterDefineClass
        );
        if (!classDoc) continue;

        const sectionDoc = classDoc.sections.id(currentYearData.section);
        const className = classDoc.className;
        const sectionName = sectionDoc ? sectionDoc.name : null;

        const rollNumberDoc = await StudentRollNumber.findOne({
          schoolId,
          admissionNumber: student.AdmissionNumber,
        });

        const rollNo = rollNumberDoc ? rollNumberDoc.rollNo : null;

        // Find or create attendance document
        let attendanceRecord = await StudentAttendance.findOne({
          schoolId,
          academicYear,
          class: className,
          section: sectionName,
          admissionNumber: student.AdmissionNumber,
        });

        if (!attendanceRecord) {
          attendanceRecord = new StudentAttendance({
            schoolId,
            academicYear,
            class: className,
            section: sectionName,
            admissionNumber: student.AdmissionNumber,
            rollNo, 
            studentName: `${student.firstName} ${student.middleName || ""} ${
              student.lastName
            }`.trim(),
            attendanceDetails: [],
          });
        }

        const alreadyMarked = attendanceRecord.attendanceDetails.some(
          (a) => new Date(a.attendanceDate).toDateString() === targetDateStr
        );

        if (!alreadyMarked) {
          attendanceRecord.attendanceDetails.push({
            attendanceDate: targetDate,
            status: "Holiday",
          });

          await attendanceRecord.save();
        }
      }
    }

    // Fetch all records for this date
    const records = await StudentAttendance.find({
      schoolId,
      academicYear,
      "attendanceDetails.attendanceDate": targetDate,
    });

    const classSectionMap = {};
    records.forEach((rec) => {
      const key = `${rec.class}-${rec.section}`;
      if (!classSectionMap[key]) {
        classSectionMap[key] = {
          schoolId: rec.schoolId,
          academicYear: rec.academicYear,
          class: rec.class,
          section: rec.section,
          students: [],
        };
      }

      const attendanceForDate = rec.attendanceDetails.find(
        (a) => new Date(a.attendanceDate).toDateString() === targetDateStr
      );

      let status = "Not Marked";

      if (isSunday || isOperationalHoliday) {
        status = "Holiday";
      } else if (attendanceForDate) {
        status = attendanceForDate.status;
      }

      classSectionMap[key].students.push({
        admissionNumber: rec.admissionNumber,
        rollNo: rec.rollNo,
        studentName: rec.studentName,
        status,
      });
    });

    return res.status(200).json({ data: Object.values(classSectionMap) });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export default getStudentAttendanceforSchool;
