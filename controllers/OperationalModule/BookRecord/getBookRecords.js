
import BookRecord from "../../../models/OperationalModule/BookRecord.js";

const getBookRecords = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ message: "School ID is required" });
    }

     const bookRecords = await BookRecord.find({ schoolId })
      .sort({ createdAt: -1 }) 
      .lean();

    if (!bookRecords || bookRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "No book records found for this school" });
    }

    res.status(200).json({
      message: "Book records retrieved successfully",
      data: bookRecords,
      count: bookRecords.length,
    });
  } catch (error) {
    console.error("Error fetching book records:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export default getBookRecords;
