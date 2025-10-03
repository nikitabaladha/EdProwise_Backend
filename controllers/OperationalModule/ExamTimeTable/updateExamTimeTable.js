// controllers/examTimeTableController.js
import ExamTimeTable from "../../../models/OperationalModule/ExamTimeTable.js";
const updateExamTimeTable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await ExamTimeTable.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ hasError: true, message: "Timetable not found" });
    }

    res.json({
      hasError: false,
      data: updated,
      message: "Timetable updated successfully",
    });
  } catch (error) {
    console.error("Error updating timetable:", error);
    res.status(500).json({ hasError: true, message: "Server error" });
  }
};
export default updateExamTimeTable;