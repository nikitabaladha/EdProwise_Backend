import TeacherFeedback from "../../../models/StudentModels/TeacherFeedback.js";
import StudentRollNumber from "../../../models/OperationalModule/StudentRollNumber.js";
import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
    const getStudentDetailsFillTeacherFeedback = async (req, res) => {
        
  try {
    const {
      schoolId,
      academicYear,
      className,
      sectionName,
      staffId,
      subjectId,
    } = req.query;
 
    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: "academicYear is required",
      });
    }
    if (!schoolId) {
  return res.status(400).json({
    success: false,
    message: "schoolId is required",
  });
}



if (!className) {
  return res.status(400).json({
    success: false,
    message: "className is required",
  });
}

if (!sectionName) {
  return res.status(400).json({
    success: false,
    message: "sectionName is required",
  });
}

if (!staffId) {
  return res.status(400).json({
    success: false,
    message: "staffId is required",
  });
}

if (!subjectId) {
  return res.status(400).json({
    success: false,
    message: "subjectId is required",
  });
}


    const feedbackRecords = await TeacherFeedback.find({
      schoolId: schoolId,
      academicYear: academicYear,
      className: className,
      sectionName: sectionName,
      staffId: staffId,
      subjectId: subjectId,
      status: "Submit", 
    }).select("admissionNumber rollNumber overallRating createdAt");

    if (!feedbackRecords || feedbackRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No feedback records found for this teacher and subject",
      });
    }

    const admissionNumbers = feedbackRecords.map(
      (record) => record.admissionNumber
    );

    // Find roll numbers for these students
    const rollNumberData = await StudentRollNumber.findOne({
      schoolId: schoolId,
      academicYear: academicYear,
      class: className,
      section: sectionName,
    });

    // Create a map of admission numbers to roll numbers
    const rollNumberMap = {};
    if (rollNumberData && rollNumberData.rollNumberDetails) {
      rollNumberData.rollNumberDetails.forEach((detail) => {
        rollNumberMap[detail.admissionNumber] = detail.rollNo;
      });
    }

    // Get additional student details from AdmissionForm
    const studentDetails = await AdmissionForm.find({
      schoolId: schoolId,
      AdmissionNumber: { $in: admissionNumbers },
    }).select("AdmissionNumber firstName middleName lastName");

    // Create a map of admission numbers to student names
    const studentNameMap = {};
    studentDetails.forEach((student) => {
      const fullName = `${student.firstName} ${
        student.middleName ? student.middleName + " " : ""
      }${student.lastName}`.trim();
      studentNameMap[student.AdmissionNumber] = fullName;
    });

    // Combine all data
    const studentsWithFeedback = feedbackRecords.map((record) => {
      const admissionNumber = record.admissionNumber;
      return {
        admissionNumber: admissionNumber,
        rollNumber: rollNumberMap[admissionNumber] || "N/A",
        studentName: studentNameMap[admissionNumber] || "Unknown",
        overallRating: record.overallRating,
        feedbackDate: record.createdAt,
        feedbackId: record._id,
      };
    });

    // Sort by roll number if available
    studentsWithFeedback.sort((a, b) => {
      if (a.rollNumber === "N/A" && b.rollNumber === "N/A") return 0;
      if (a.rollNumber === "N/A") return 1;
      if (b.rollNumber === "N/A") return -1;
      return a.rollNumber - b.rollNumber;
    });

    // Calculate statistics
    const totalStudents = studentsWithFeedback.length;
    const averageRating =
      totalStudents > 0
        ? parseFloat(
            (
              studentsWithFeedback.reduce(
                (sum, student) => sum + student.overallRating,
                0
              ) / totalStudents
            ).toFixed(2)
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        className: className,
        sectionName: sectionName,
        academicYear: academicYear,
        staffId: staffId,
        subjectId: subjectId,
        totalStudents: totalStudents,
        averageRating: averageRating,
        students: studentsWithFeedback,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher feedback students:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getStudentDetailsFillTeacherFeedback;
