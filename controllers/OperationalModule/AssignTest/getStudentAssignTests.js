import AssignTest from "../../../models/OperationalModule/AssignTest.js";
import StudentRegistration from "../../../models/FeesModule/RegistrationFormCopy.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import EntranceExamSubject from "../../../models/OperationalModule/EntranceExamSubject.js";
const getStudentAssignTests = async (req, res) => {
  try {
    const { schoolId, academicYear, registrationNumber, classId } = req.query;

    if (!schoolId || !academicYear || !registrationNumber || !classId) {
      return res.status(400).json({
        hasError: true,
        message:
          "schoolId, academicYear, registrationNumber and classId are required",
      });
    }

    // 1. Get student details
    const student = await StudentRegistration.findOne({
      schoolId,
      academicYear,
      registrationNumber,
    }).lean();

    if (!student) {
      return res.status(404).json({
        hasError: true,
        message: "Student not found",
      });
    }

    // 2. Get class name and section name
    let className = null;
    const classDoc = await ClassAndSection.findById(classId).lean();
    if (classDoc) {
      className = classDoc.className;
     
    }

    // 3. Get all AssignTest records for this student
    const assignTests = await AssignTest.find({
      schoolId,
      academicYear,
      registrationNumber,
    })
      .sort({ createdAt: -1 }) // latest first
      .lean();

    const classSubjects = await EntranceExamSubject.findOne({
      schoolId,
      academicYear,
      classId: classId, 
    }).lean();
  
    console.log("classSubject",classSubjects);
    
    const subjectMap = {};
    if (classSubjects?.subjects?.length) {
      classSubjects.subjects.forEach((sub) => {
        subjectMap[sub._id.toString()] = sub.subjectName;
      });
    }
 
    console.log("subjectMap",subjectMap);
    
    const enrichedAssignTests = assignTests.map((record) => {
      const enrichedTestDetails = record.testDetails.map((td) => {
        let subjectName = "All Subjects";
        if (td.subjectId) {
          subjectName =
            subjectMap[td.subjectId.toString()] || "Unknown Subject";
        }
        return { ...td, subjectName };
      });

      return {
        ...record,
        testDetails: enrichedTestDetails,
      };
    });

    return res.status(200).json({
      hasError: false,
      message: "Assign tests fetched successfully",
      student: {
        _id: student._id,
        registrationNumber: student.registrationNumber,
        studentName: `${student.firstName} ${student.middleName || ""} ${
          student.lastName
        }`
          .replace(/\s+/g, " ")
          .trim(),
        className,
        registrationDate: student.registrationDate,
      },
      data: enrichedAssignTests,
    });
  } catch (error) {
    console.error("Error fetching student assign tests:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch student assign tests",
      error: error.message,
    });
  }
};

export default getStudentAssignTests;
