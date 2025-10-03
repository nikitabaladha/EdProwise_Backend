import StudentRegistration from "../../../models/FeesModule/RegistrationFormCopy.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";

const getStudentRegistrationInfoByClassId = async (req, res) => {
  try {
    const { schoolId, academicYear, classId } = req.query;

    if (!schoolId) {
      return res
        .status(400)
        .json({ hasError: true, message: "School ID is required" });
    }
    if (!academicYear) {
      return res
        .status(400)
        .json({ hasError: true, message: "Academic Year is required" });
    }
    if (!classId) {
      return res
        .status(400)
        .json({ hasError: true, message: "Class ID is required" });
    }

    // 1️⃣ Find the class document
    const classDoc = await ClassAndSection.findById(classId).lean();
    if (!classDoc) {
      return res.status(404).json({
        hasError: true,
        message: "Class not found for the given classId",
      });
    }

    // 2️⃣ Fetch students registered in this class
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

    // 3️⃣ Map students with className and sectionName
    const studentList = students.map((student) => {
      let sectionName = null;
      if (student.section) {
        const sectionDoc = classDoc.sections?.id(student.section);
        if (sectionDoc) {
          sectionName = sectionDoc.name;
        }
      }

      return {
        _id: student._id,
        firstName: student.firstName,
        middleName: student.middleName || "",
        lastName: student.lastName,
        studentName: `${student.firstName} ${student.middleName || ""} ${
          student.lastName
        }`.trim(),
        registrationNumber: student.registrationNumber,
        registrationDate: student.registrationDate,
        academicYear: student.academicYear,
        className: classDoc.className,
        sectionName,
        dateOfBirth: student.dateOfBirth,
        age: student.age,
      };
    });

    res.status(200).json({
      hasError: false,
      message: "Students fetched successfully",
      data: studentList,
    });
  } catch (error) {
    console.error("Error fetching students by class:", error);
    res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getStudentRegistrationInfoByClassId;
