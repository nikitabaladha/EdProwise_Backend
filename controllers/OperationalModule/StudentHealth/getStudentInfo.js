import AdmissionForm from '../../../models/FeesModule/AdmissionForm.js';
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
const getStudentInfo = async (req, res) => {
  try {
    const { admissionNumber, schoolId, academicYear } = req.query;
       console.log("admissionNumber", admissionNumber);
       console.log("School Id", schoolId);
       console.log("academicYear", academicYear);
    if (!admissionNumber) {
      return res
        .status(400)
        .json({ hasError: true, message: "Missing Admission Number fields" });
    }
    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId Missing fields",
      });
    }

    if (!academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "academicYear Missing fields",
      });
    }

    const student = await AdmissionForm.findOne({
      AdmissionNumber: admissionNumber,
      schoolId,
      academicYear,
    });
   console.log("Student Details:", student);
    
    if (!student) {
      return res
        .status(404)
        .json({ hasError: true, message: "No student records found." });
    }
    
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

    res.status(200).json({
      hasError: false,
      data: {
        studentName: `${student.firstName} ${student.middleName || ""} ${
          student.lastName
        }`.trim(),
        firstName: student.firstName,
        lastName: student.lastName,
        age: student.age,
        admissionNumber: student.AdmissionNumber,
        academicYear: student.academicYear,
        class: className || null,
        section: sectionName || null,
        dateOfBirth: student.dateOfBirth,
        studentPhoto: student.studentPhoto,
        id: student._id,
      }, 
    });
  } catch (err) {
    res
      .status(500)
      .json({ hasError: true, message: "Failed to retrieve student records." });
  }
};

export default getStudentInfo;
