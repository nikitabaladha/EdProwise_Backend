
import AssignTest from "../../../models/OperationalModule/AssignTest.js";
import StudentRegistration from "../../../models/FeesModule/RegistrationFormCopy.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";

const getAssignTests = async (req, res) => {
  try {
    const { schoolId, academicYear, classId, result } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    const filter = { schoolId, academicYear };
    if (classId) filter.classId = classId;
    if (result && result !== "All") filter.result = result;

    // 1️⃣ Fetch AssignTest Records
    let records = await AssignTest.find(filter).sort({ createdAt: -1 }).lean();

    // 2️⃣ Enrich records with student + class name
    const enrichedRecords = await Promise.all(
      records.map(async (record) => {
        let studentName = "Unknown Student";
        let className = "Unknown Class";
        let sectionName = null;

        // 🔹 Get Student Name
        if (record.registrationNumber) {
          const student = await StudentRegistration.findOne({
            schoolId,
            academicYear,
            registrationNumber: record.registrationNumber,
          }).lean();

          if (student) {
            studentName = `${student.firstName} ${student.middleName || ""} ${
              student.lastName
            }`
              .replace(/\s+/g, " ")
              .trim();
          }
        }

        // 🔹 Get Class Name (and Section)
        if (record.classId) {
          const classDoc = await ClassAndSection.findById(
            record.classId
          ).lean();
          if (classDoc) {
            className = classDoc.className;
            if (record.sectionId) {
              const sectionDoc = classDoc.sections.id(record.sectionId);
              if (sectionDoc) sectionName = sectionDoc.name;
            }
          }
        }

        return {
          ...record,
          studentName,
          className,
          sectionName,
        };
      })
    );

    return res.status(200).json({
      hasError: false,
      data: enrichedRecords,
    });
  } catch (error) {
    console.error("Error fetching assign test records:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch assign test records",
      error: error.message,
    });
  }
};

export default getAssignTests;

