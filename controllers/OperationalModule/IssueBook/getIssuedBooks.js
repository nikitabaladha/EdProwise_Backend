import BookIssue from "../../../models/OperationalModule/BookIssue.js";

const getIssuedBooks = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const records = await BookIssue.find({ schoolId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default getIssuedBooks;