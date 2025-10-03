import BookIssue from "../../../models/OperationalModule/BookIssue.js";

const issueBook = async (req, res) => {
  try {
    const {
      schoolId,
      bookName,
      recordNumber,
      admissionNumber,
      studentName,
      issueBy,
    } = req.body;
 console.log("RecordNumber", recordNumber);
 
    const missingFields = [];
    if (!schoolId) missingFields.push("schoolId");
    if (!bookName) missingFields.push("bookName");
    if (!recordNumber) missingFields.push("recordNumber");
    if (!admissionNumber) missingFields.push("admissionNumber");
    if (!studentName) missingFields.push("studentName");
    if (!issueBy) missingFields.push("issueBy");

    // If any required field is missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    const issue = new BookIssue({
      schoolId,
      bookName,
      recordNumber,
      admissionNumber,
      studentName,
      issueBy,
    });

    await issue.save();

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default issueBook;
