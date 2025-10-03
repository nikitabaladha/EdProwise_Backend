import StudentRollNumber from "../../../models/OperationalModule/StudentRollNumber.js";

const deleteStudentRollNumber = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "StudentRollNumber ID is required",
      });
    }

    const deletedRecord = await StudentRollNumber.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({
        hasError: true,
        message: "StudentRollNumber record not found",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "StudentRollNumber record deleted successfully",
      data: deletedRecord,
    });
  } catch (error) {
    console.error("Error deleting StudentRollNumber record:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete StudentRollNumber record",
    });
  }
};

export default deleteStudentRollNumber;
