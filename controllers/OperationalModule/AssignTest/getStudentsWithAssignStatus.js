import StudentRegistration from "../../../models/FeesModule/RegistrationFormCopy.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
import AssignTest from "../../../models/OperationalModule/AssignTest.js";

const getStudentsWithAssignStatus = async (req, res) => {
  try {
    const { schoolId, academicYear, classId, subjectId } = req.query;

    if (!schoolId || !academicYear || !classId || !subjectId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId, academicYear, classId and subjectId are required",
      });
    }

    // 1. Get all students of this class
    const students = await StudentRegistration.find({
      schoolId,
      academicYear,
      masterDefineClass: classId,
    }).lean();

    if (!students.length) {
      return res.status(404).json({
        hasError: true,
        message: "No students found for this class",
      });
    }

    // 2. Get assigned tests for this class+subject
    const assignedTests = await AssignTest.find({
      schoolId,
      academicYear,
      classId,
      "testDetails.subjectId": subjectId,
    }).lean();

    // Build a set of registrationNumbers with assigned tests
    const assignedRegNos = new Set();
    assignedTests.forEach((doc) => {
      doc.testDetails.forEach((td) => {
        if (td.subjectId.toString() === subjectId.toString()) {
          assignedRegNos.add(doc.registrationNumber);
        }
      });
    });

    // 3. Attach `isAlreadyAssigned` flag to students
    const result = await Promise.all(
      students.map(async (student) => {
        let className = null;
        let sectionName = null;

        if (student.masterDefineClass && student.section) {
          const classDoc = await ClassAndSection.findById(student.masterDefineClass).lean();
          if (classDoc) {
            className = classDoc.className;
            const sectionDoc = classDoc.sections.id(student.section);
            if (sectionDoc) sectionName = sectionDoc.name;
          }
        }

        return {
          _id: student._id,
          registrationNumber: student.registrationNumber,
          firstName: student.firstName,
          middleName: student.middleName || "",
          lastName: student.lastName,
          studentName: `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim(),
          registrationDate: student.registrationDate,
          class: className,
          section: sectionName,
          isAlreadyAssigned: assignedRegNos.has(student.registrationNumber),
        };
      })
    );

    res.status(200).json({
      hasError: false,
      message: "Students fetched successfully with assignment status",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching students with assignment status:", error);
    res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getStudentsWithAssignStatus;
