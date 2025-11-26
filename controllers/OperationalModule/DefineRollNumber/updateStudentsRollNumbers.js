import StudentRollNumber from "../../../models/OperationalModule/StudentRollNumber.js";
const updateStudentsRollNumbers = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode, sortField, sortOrder, students } = req.body;

    if (!students || students.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "Students list is required",
      });
    }

    const rollNumberDetails = students.map((s) => ({
      admissionNumber: s.admissionNumber,
      rollNo: s.rollNo,
      studentName: s.studentName,
    }));

    const updated = await StudentRollNumber.findByIdAndUpdate(
      id,
      {
        mode,
        sortField,
        sortOrder,
        rollNumberDetails,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        hasError: true,
        message: "Record not found",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Roll numbers updated successfully",
      data: updated,
    }); 
  } catch (error) {
    console.error("Error updating roll numbers:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update roll numbers",
    });
  }
};

export default updateStudentsRollNumbers;
