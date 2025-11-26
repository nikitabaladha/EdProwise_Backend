// import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";

// const getTimePeriodForClassAndSection = async (req, res) => {
//   try {
//     const { schoolId, academicYear, className, sectionName } = req.params;

//     const record = await TimePeriod.findOne({
//       schoolId,
//       academicYear,
//       className,
//       sectionName,
//     });

//     if (!record) {
//       return res
//         .status(404)
//         .json({ hasError: true, message: "No TimePeriod found" });
//     }

//     res.json({ hasError: false, data: record });
//   } catch (error) {
//     console.error("Error fetching TimePeriod:", error);
//     res.status(500).json({ hasError: true, message: "Internal server error" });
//   }
// };

// export default getTimePeriodForClassAndSection;

import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const getTimePeriodForClassAndSection = async (req, res) => {
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

    // Fetch class subjects to map subjectId -> subjectName (for display only)
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

    // Attach subjectName for frontend display, but keep subjectId intact
    const detailsWithNames = timePeriod.timePeriodDetails.map((d) => ({
      ...d,
      subjectName: subjectMap[d.subjectId?.toString()] || "N/A",
    }));

    // Get unique staffIds from details
    const staffIds = [
      ...new Set(detailsWithNames.map((d) => d.staffId).filter((id) => !!id)),
    ];

    // Fetch staff names
    const employees = await EmployeeRegistration.find(
      { employeeId: { $in: staffIds } },
      { employeeId: 1, employeeName: 1 }
    ).lean();

    const employeeMap = {};
    employees.forEach((emp) => {
      employeeMap[emp.employeeId] = emp.employeeName;
    });

    // Attach staffName for frontend display
    const finalDetails = detailsWithNames.map((d) => ({
      ...d,
      staffName: employeeMap[d.staffId] || "N/A",
    }));

    return res.status(200).json({
      hasError: false,
      data: {
        _id: timePeriod._id,
        schoolId: timePeriod.schoolId,
        academicYear: timePeriod.academicYear,
        className: timePeriod.className,
        sectionName: timePeriod.sectionName,
        timePeriodDetails: finalDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching class time period:", error);
    res.status(500).json({
      hasError: true,
      message: "Server error while fetching class time period",
    });
  }
};

export default getTimePeriodForClassAndSection;
