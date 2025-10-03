import StudentHealthDetail from "../../../models/OperationalModule/StudentHealthDetail.js";
const deleteStudentHealthRecord = async (req, res) => {
  try {
    const { id } = req.params; 
    const deletedRecord = await StudentHealthDetail.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res
        .status(404)
        .json({ hasError: true, message: "Record not found" });
    }

    return res
      .status(200)
      .json({ hasError: false, message: "Record deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ hasError: true, message: "Server error" });
  }
};
export default deleteStudentHealthRecord;
