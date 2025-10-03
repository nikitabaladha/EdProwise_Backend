import BookRecord from "../../../models/OperationalModule/BookRecord.js";

const deleteBookRecord = async (req, res) => {
  try {
    const { recordId, bookId } = req.params;
    const updatedRecord = await BookRecord.findByIdAndUpdate(
      recordId,
      { $pull: { bookDetails: { _id: bookId } } },
      { new: true }
    );

    if (!updatedRecord) {
      return res
        .status(404)
        .json({ hasError: true, message: "Record not found" });
    }

    return res.status(200).json({
      hasError: false,
      message: "Book deleted successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ hasError: true, message: "Server error" });
  }
};

export default deleteBookRecord;
