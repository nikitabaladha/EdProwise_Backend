import ExamTimeTable from "../../../models/OperationalModule/ExamTimeTable.js";

const deleteExamTimeTable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Exam timetable ID is required",
      });
    }

    const deleted = await ExamTimeTable.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        hasError: true,
        message: "Exam timetable not found",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Exam timetable deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting exam timetable:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while deleting exam timetable",
    });
  }
};

export default deleteExamTimeTable;
