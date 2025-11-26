import BookIssue from "../../../models/OperationalModule/BookIssue.js";

const updateIssueBook = async (req, res) => {
  try {
    const {
      _id,
      schoolId,
      bookName,
      recordNumber,
      admissionNumber,
      studentName,
      issueBy,
      issueDate,
    } = req.body;

    const missingFields = [];
    if (!_id) missingFields.push("_id");
    if (!schoolId) missingFields.push("schoolId");
    if (!bookName) missingFields.push("bookName");
    if (!recordNumber) missingFields.push("recordNumber");
    if (!admissionNumber) missingFields.push("admissionNumber");
    if (!studentName) missingFields.push("studentName");
    if (!issueBy) missingFields.push("issueBy");
    if (!issueDate) missingFields.push("issueDate");

    if (missingFields.length > 0) {
      return res.status(400).json({
        hasError: true,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    const updatedIssue = await BookIssue.findByIdAndUpdate(
      _id,
      {
        schoolId,
        bookName,
        recordNumber,
        admissionNumber,
        studentName,
        issueBy,
        issueDate,
      },
      { new: true, runValidators: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({
        hasError: true,
        message: "Book issue record not found",
      });
    }

    res.status(200).json({
      hasError: false,
      message: "Book issue record updated successfully",
      data: updatedIssue,
    });
  } catch (error) {
    res.status(500).json({
      hasError: true,
      message: error.message,
    });
  }
};

export default updateIssueBook;
