import EntranceExamSubject from "../../../models/OperationalModule/EntranceExamSubject.js";

const deleteEnteanceExam = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedData = await EntranceExamSubject.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(404).json({
        hasError: true,
        message: "Entrance exam subject not found",
      });
    }

    res.status(200).json({
      hasError: false,
      message: "Entrance exam subjects deleted successfully",
      data: deletedData,
    });
  } catch (error) {
    console.error("DELETE EntranceExamSubject ERROR:", error);
    res.status(500).json({ hasError: true, message: "Server error", error });
  }
};

export default deleteEnteanceExam;