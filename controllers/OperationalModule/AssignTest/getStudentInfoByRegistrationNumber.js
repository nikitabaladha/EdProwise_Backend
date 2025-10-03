// import StudentRegistration from "../../../models/FeesModule/RegistrationForm.js";
// import ClassSection from "../../../models/FeesModule/Class&Section.js";
// const getStudentInfoByRegistrationNumber = async (req, res) => {
//   try {
//     const { schoolId, academicYear, registrationNumber } = req.query;

//     if (!schoolId) {
//       return res.status(400).json({ message: "School id is required" });
//     }
//     if (!academicYear) {
//       return res.status(400).json({ message: "Academic Year is required" });
//     }
//     if (!registrationNumber) {
//       return res
//         .status(400)
//         .json({ message: "Registration Number is required" });
//     }

//     const studentRecords = await StudentRegistration.findOne({
//       schoolId,
//       academicYear,
//       registrationNumber,
//     });

//     if (!studentRecords) {
//       return res.status(404).json({
//         message: "No student records found for this school",
//       });
//     }

//     res.status(200).json({
//       message: "Student records retrieved successfully",
//       data: studentRecords,
//     });
//   } catch (error) {
//     console.error("Error fetching student records:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

// export default getStudentInfoByRegistrationNumber;

import StudentRegistration from "../../../models/FeesModule/RegistrationForm.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";

const getStudentInfoByRegistrationNumber = async (req, res) => {
  try {
    const { schoolId, academicYear, registrationNumber } = req.query;

    if (!schoolId) {
      return res
        .status(400)
        .json({ hasError: true, message: "School id is required" });
    }
    if (!academicYear) {
      return res
        .status(400)
        .json({ hasError: true, message: "Academic Year is required" });
    }
    if (!registrationNumber) {
      return res
        .status(400)
        .json({ hasError: true, message: "Registration Number is required" });
    }

    const student = await StudentRegistration.findOne({
      schoolId,
      academicYear,
      registrationNumber,
    }).lean();

    if (!student) {
      return res.status(404).json({
        hasError: true,
        message: "No student records found for this registration number",
      });
    }

    // Resolve class & section details
    let className = null;
    let sectionName = null;

    if (student.masterDefineClass) {
      const classDoc = await ClassAndSection.findById(
        student.masterDefineClass
      );

      if (classDoc) {
        className = classDoc.className;

        if (student.section) {
          const sectionDoc = classDoc.sections.id(student.section);
          if (sectionDoc) {
            sectionName = sectionDoc.name;
          }
        }
      }
    }

    const result = {
      _id: student._id,
      firstName: student.firstName,
      middleName: student.middleName || "",
      lastName: student.lastName,
      studentName: `${student.firstName} ${student.middleName || ""} ${
        student.lastName
      }`.trim(),
      registrationNumber: student.registrationNumber,
      registrationDate:student.registrationDate,
      academicYear: student.academicYear,
      class: className,
      section: sectionName,
      dateOfBirth: student.dateOfBirth,
      age: student.age,
    };

    res.status(200).json({
      hasError: false,
      message: "Student record retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching student records:", error);
    res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getStudentInfoByRegistrationNumber;
