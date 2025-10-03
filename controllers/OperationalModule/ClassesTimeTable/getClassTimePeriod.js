// import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";
// import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
// import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
// const getClassTimePeriod = async (req, res) => {
//   try {
//     const { schoolId, academicYear, className, sectionName } = req.params;

//     if (!schoolId || !academicYear || !className || !sectionName) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "Missing required parameters" });
//     }

//     const timePeriod = await TimePeriod.findOne({
//       schoolId,
//       academicYear,
//       className,
//       sectionName,
//     }).lean();

//     if (!timePeriod) {
//       return res
//         .status(404)
//         .json({
//           hasError: true,
//           message: "No time period found for this class & section",
//         });
//     }

//     // Fetch subjects for this class & section
//     const classSubjects = await ClassSubject.findOne({
//       schoolId,
//       academicYear,
//       class: className,
//       section: sectionName,
//     }).lean();

//     const subjectMap = {};
//     classSubjects?.subjects.forEach((sub) => {
//       subjectMap[sub._id.toString()] = sub.subjectName;
//     });

//     // Attach subjectName manually
//     timePeriod.timePeriodDetails = timePeriod.timePeriodDetails.map((d) => ({
//       ...d,
//       subjectName: subjectMap[d.subjectId] || "N/A",
//     }));

//     // Fetch employee details
//     const staffIds = [
//       ...new Set(timePeriod.timePeriodDetails.map((d) => d.staffId)),
//     ];
//     const employees = await EmployeeRegistration.find(
//       { employeeId: { $in: staffIds } },
//       { employeeId: 1, employeeName: 1 }
//     ).lean();

//     const employeeMap = {};
//     employees.forEach((emp) => (employeeMap[emp.employeeId] = emp));

//     // Build timetable
//     const timetableMap = {};
//     timePeriod.timePeriodDetails.forEach((detail) => {
//       const slot = `${detail.fromTime} - ${detail.toTime}`;
//       if (!timetableMap[slot]) {
//         timetableMap[slot] = {
//           time: slot,
//           Monday: "",
//           Tuesday: "",
//           Wednesday: "",
//           Thursday: "",
//           Friday: "",
//           Saturday: "",
//         };
//       }
//       timetableMap[slot][detail.day] = detail.subjectName;
//     });

//     // Build staff details
//     const staffMap = new Map();
//     timePeriod.timePeriodDetails.forEach((detail) => {
//       const emp = employeeMap[detail.staffId];
//       const key = `${detail.subjectId}-${detail.staffId}`;
//       if (!staffMap.has(key)) {
//         staffMap.set(key, {
//           subject: detail.subjectName,
//           staffName: emp?.employeeName || "N/A",
//         });
//       }
//     });

//     return res.status(200).json({
//       hasError: false,
//       data: {
//         className,
//         sectionName,
//         timetable: Object.values(timetableMap),
//         staffDetails: Array.from(staffMap.values()),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching class time period:", error);
//     res
//       .status(500)
//       .json({
//         hasError: true,
//         message: "Server error while fetching class timetable",
//       });
//   }
// };

// export default getClassTimePeriod;

import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const getClassTimePeriod = async (req, res) => {
  try {
    const { schoolId, academicYear, className, sectionName } = req.params;

    if (!schoolId || !academicYear || !className || !sectionName) {
      return res.status(400).json({
        hasError: true,
        message: "Missing required parameters",
      });
    }

    // Fetch time period document
    const timePeriod = await TimePeriod.findOne({
      schoolId,
      academicYear,
      className,
      sectionName,
    }).lean();

    if (!timePeriod) {
      return res.status(404).json({
        hasError: true,
        message: "No time period found for this class & section",
      });
    }

    const classSubjects = await ClassSubject.findOne({
      schoolId,
      academicYear,
      class: className,
      section: sectionName,
    }).lean();

    const subjectMap = {};
    classSubjects?.subjects?.forEach((sub) => {
      subjectMap[sub._id.toString()] = sub.subjectName;
    });

    timePeriod.timePeriodDetails = timePeriod.timePeriodDetails.map((d) => ({
      ...d,
      subjectName: subjectMap[d.subjectId] || "N/A",
    }));

    const staffIds = [
      ...new Set(
        timePeriod.timePeriodDetails.map((d) => d.staffId).filter((id) => id) // remove null/undefined
      ),
    ];

    const employees = await EmployeeRegistration.find(
      { employeeId: { $in: staffIds } },
      { employeeId: 1, employeeName: 1 }
    ).lean();

    const employeeMap = {};
    employees.forEach((emp) => (employeeMap[emp.employeeId] = emp));

    const timetableMap = {};
    timePeriod.timePeriodDetails.forEach((detail) => {
      const slot = `${detail.fromTime} - ${detail.toTime}`;
      if (!timetableMap[slot]) {
        timetableMap[slot] = {
          time: slot,
          fromTime: detail.fromTime,
          Monday: "",
          Tuesday: "",
          Wednesday: "",
          Thursday: "",
          Friday: "",
          Saturday: "",
        };
      }
      timetableMap[slot][detail.day] = detail.subjectName;
    });

    
    const sortedTimetable = Object.values(timetableMap).sort((a, b) =>
      a.fromTime.localeCompare(b.fromTime)
    );

    const staffMap = new Map();
    timePeriod.timePeriodDetails.forEach((detail) => {
      const emp = employeeMap[detail.staffId];
      const key = `${detail.subjectId}-${detail.staffId}`;
      if (!staffMap.has(key)) {
        staffMap.set(key, {
          subject: detail.subjectName,
          staffName: emp?.employeeName || "N/A",
        });
      }
    });

    return res.status(200).json({
      hasError: false,
      data: {
        className,
        sectionName,
        timetable: sortedTimetable,
        staffDetails: Array.from(staffMap.values()),
      },
    });
  } catch (error) {
    console.error("Error fetching class time period:", error);
    res.status(500).json({
      hasError: true,
      message: "Server error while fetching class timetable",
    });
  }
};

export default getClassTimePeriod;
