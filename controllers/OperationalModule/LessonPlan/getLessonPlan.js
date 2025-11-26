import LessonPlan from "../../../models/OperationalModule/LessonPlan.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";

const getLessonPlan = async (req, res) => {
  try {
    const { schoolId, academicYear, className, sectionName } = req.query;

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

    // Fetch lesson plans
    const lessonPlans = await LessonPlan.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (!lessonPlans.length) {
      return res.status(200).json({
        hasError: false,
        data: [],
        message: "No lesson plans found",
      });
    }

    // ---------- Collect unique subjectIds & staffIds ----------
    const subjectIds = [];
    const staffIds = [];

    lessonPlans.forEach((plan) => {
      if (plan.subjectId && !subjectIds.includes(plan.subjectId.toString())) {
        subjectIds.push(plan.subjectId.toString());
      }
      if (plan.staffId && !staffIds.includes(plan.staffId)) {
        staffIds.push(plan.staffId);
      }
    });

    // ---------- Fetch Subject Names ----------
    let subjectMap = {};
    if (subjectIds.length > 0) {
      const subjectQuery = {
        schoolId,
        academicYear,
        "subjects._id": { $in: subjectIds },
      };
      if (className) subjectQuery.class = className;
      if (sectionName) subjectQuery.section = sectionName;

      const classSubjectsData = await ClassSubject.find(subjectQuery).lean();

      classSubjectsData.forEach((classSubject) => {
        classSubject.subjects?.forEach((sub) => {
          subjectMap[sub._id.toString()] = sub.subjectName;
        });
      });
    }

    // ---------- Fetch Staff Names ----------
    let staffMap = {};
    if (staffIds.length > 0) {
      const employees = await EmployeeRegistration.find(
        { schoolId, employeeId: { $in: staffIds } },
        { employeeId: 1, employeeName: 1 }
      ).lean();

      employees.forEach((emp) => {
        staffMap[emp.employeeId] = emp.employeeName;
      });
    }

    // ---------- Enrich Lesson Plans ----------
    // const enrichedLessonPlans = lessonPlans.map((plan) => ({
    //   ...plan,

    //   subjectName: subjectMap[plan.subjectId?.toString()] || "Unknown Subject",
    //   staffName: staffMap[plan.staffId] || "Unknown Staff",
    // }));

    // ---------- Enrich Lesson Plans & Calculate Complete Percentage ----------
    const enrichedLessonPlans = lessonPlans.map((plan) => {
      const totalChapters = plan.chapters?.length || 0;
      const completedChapters =
        plan.chapters?.filter((ch) => ch.status === "Completed").length || 0;

      const completePercentage =
        totalChapters > 0
          ? ((completedChapters / totalChapters) * 100).toFixed(2) + "%"
          : "0%";

      return {
        ...plan,
        completePercentage, // ✅ dynamic calculation
        subjectName:
          subjectMap[plan.subjectId?.toString()] || "Unknown Subject",
        staffName: staffMap[plan.staffId] || "Unknown Staff",
      };
    });

    return res.status(200).json({
      hasError: false,
      data: enrichedLessonPlans,
    });
  } catch (err) {
    console.error("Error fetching lesson plans:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching lesson plans",
    });
  }
};

export default getLessonPlan;
