// import StudentHealthDetail from "../models/StudentHealthDetail.js";
import StudentHealthDetail from "../../../models/OperationalModule/StudentHealthDetail.js";
const createStudentHealthRecord = async (req, res) => {
  try {
    const {
      schoolId,
      admissionNumber,
      studentName,
      dateOfBirth,
      academicYear,
      class: classId,
      section,
      age,
      height,
      weight,
      bmi,
      bloodGroup,
      chronic,
      physicalDisability,
      surgery,
    } = req.body;

    if (
      !schoolId ||
      !admissionNumber ||
      !studentName ||
      !dateOfBirth ||
      !academicYear ||
      !classId ||
      !section ||
      !age ||
      !height ||
      !weight ||
      !bmi ||
      !bloodGroup
    ) {
      return res.status(400).json({
        hasError: true,
        message: "All required fields must be provided",
      });
    }

    const newRecord = new StudentHealthDetail({
      schoolId,
      admissionNumber,
      studentName,
      dateOfBirth,
      healthDetails: [
        {
          academicYear,
          class: classId,
          section,
          age,
          height,
          weight,
          bmi,
          bloodGroup,
          chronic,
          physicalDisability,
          surgery,
        },
      ],
    });

    await newRecord.save();

    return res.status(201).json({
      hasError: false,
      message: "Student health record created successfully",
      data: newRecord,
    });
  } catch (error) {
    console.error("Error creating student health record:", error);
    res.status(500).json({
      hasError: true,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export default createStudentHealthRecord;