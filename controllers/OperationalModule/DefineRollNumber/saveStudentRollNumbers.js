import StudentRollNumber from "../../../models/OperationalModule/StudentRollNumber.js";
const saveStudentRollNumbers = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      className,
      section,
      mode,
      sortField,
      sortOrder,
      students,  
    } = req.body;

    if (!schoolId || !academicYear || !className || !section || !students) {
      return res.status(400).json({
        hasError: true,
        message: "Missing required fields",
      });
    }

    
    const rollNumberDetails = students.map((s) => ({
      admissionNumber: s.admissionNumber,
      rollNo: s.rollNo,
      studentName: s.studentName
    }));

    
    const record = await StudentRollNumber.findOneAndUpdate(
      { schoolId, academicYear, class: className, section },
      {
        schoolId,
        academicYear,
        class: className,
        section,
        mode,
        sortField,
        sortOrder,
        rollNumberDetails,
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      hasError: false,
      message: "Roll numbers saved successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error saving roll numbers:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to save roll numbers",
    });
  }
};

export default saveStudentRollNumbers;