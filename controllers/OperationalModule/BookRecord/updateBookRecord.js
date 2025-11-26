import BookRecord from "../../../models/OperationalModule/BookRecord.js";

const updateBookRecord = async (req, res) => {
  try {
    const { recordId, bookId } = req.params;
    const { bookName, authorName, publicationYear, entryDate, bookLocation } =
      req.body;

    if (!recordId || !bookId) {
      return res
        .status(400)
        .json({ message: "Record ID and Book ID are required" });
    }

    const updatedRecord = await BookRecord.findOneAndUpdate(
      { _id: recordId, "bookDetails._id": bookId },
      {
        $set: {
          "bookDetails.$.bookName": bookName,
          "bookDetails.$.authorName": authorName,
          "bookDetails.$.publicationYear": publicationYear,
          "bookDetails.$.entryDate": entryDate,
          "bookDetails.$.bookLocation": bookLocation,
        },
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: "Book record not found" });
    }

    res.status(200).json({
      message: "Book record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating book record:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export default updateBookRecord;
