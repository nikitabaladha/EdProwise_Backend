import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";

const getStudentRecords = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;
    const { class: classId, section: sectionId } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required",
      });
    }

    if (!academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "academicYear is required",
      });
    }

    const query = { schoolId, academicYear };

    const students = await AdmissionForm.find(query).lean();

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ hasError: true, message: "No student records found." });
    }

    const results = await Promise.all(
      students.map(async (student) => {
        const currentYearData = student.academicHistory.find(
          (entry) => entry.academicYear === academicYear
        );

        let className = null;
        let sectionName = null;

        if (currentYearData) {
          const classDoc = await ClassAndSection.findById(
            currentYearData.masterDefineClass
          );

          if (classDoc) {
            className = classDoc.className;

            const sectionDoc = classDoc.sections.id(currentYearData.section);
            if (sectionDoc) {
              sectionName = sectionDoc.name;
            }
          }
        }

        return {
          _id: student._id,
          firstName:student.firstName,
          middleName: student.middleName || "",
          lastName: student.lastName, 
          admissionNumber: student.AdmissionNumber,
          academicYear: student.academicYear,
          class: className,
          section: sectionName,
          dateOfBirth: student.dateOfBirth,
          age: student.age,
        };
      })
    );

    let filteredResults = results;
    if (classId) {
      filteredResults = filteredResults.filter(
        (s) => String(s.class) === String(classId)
      );
    }
    if (sectionId) {
      filteredResults = filteredResults.filter(
        (s) => String(s.section) === String(sectionId)
      );
    }

    res.status(200).json({
      hasError: false,
      data: filteredResults,
    });
  } catch (err) {
    console.error("Error in getStudentRecords:", err);
    res.status(500).json({
      hasError: true,
      message: "Failed to retrieve student records.",
    });
  }
};

export default getStudentRecords;
