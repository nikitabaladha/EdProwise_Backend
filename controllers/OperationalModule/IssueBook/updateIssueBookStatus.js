import BookIssue from "../../../models/OperationalModule/BookIssue.js";

// Update book issue status when a book is received
export const updateIssueBookStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { receiveDate, receiveBy, status } = req.body;

    if (!receiveBy || !receiveDate) {
      return res.status(400).json({
        success: false,
        message: "Both receiveDate and receiveBy are required",
      });
    }

    // Find the record and update
    const updatedRecord = await BookIssue.findByIdAndUpdate(
      id,
      {
        receivedDate: receiveDate,
        receivedBy: receiveBy,
        status: status || "returned",
      },
      { new: true } // return the updated document
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Book issue record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book status updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating book status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export default updateIssueBookStatus;
