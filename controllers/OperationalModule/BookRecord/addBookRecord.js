import BookRecord, { BookRecordCounter } from "../../../models/OperationalModule/BookRecord.js";
import School from "../../../models/School.js";
import mongoose from "mongoose";

function getSchoolInitials(schoolName) {
  if (!schoolName) return "XX";
  const words = schoolName.trim().split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    return words[0].substring(0, 2).toUpperCase();
  }
}

const addBookRecord = async (req, res) => {
  try {
    const { schoolId, bookDetails } = req.body;

    if (!schoolId || !bookDetails || !Array.isArray(bookDetails)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const school = await School.findOne({ schoolId: schoolId });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const schoolInitials = getSchoolInitials(school.schoolName);

    let counter = await BookRecordCounter.findOne({ schoolId });
    if (!counter) {
      counter = new BookRecordCounter({ schoolId, bookRecordSeq: 0 });
    }

    //  Assign recordNumbers to each book
    const updatedBookDetails = bookDetails.map((book) => {
      counter.bookRecordSeq += 1;
      return {
        ...book,
        recordNumber: `${schoolInitials}BK${counter.bookRecordSeq}`,
      };
    });

    //  Save counter back
    await counter.save();

    // Save book record
    const newRecord = new BookRecord({
      schoolId,
      bookDetails: updatedBookDetails,
    });

    await newRecord.save();

    res.status(201).json({
      message: "Book records added successfully",
      data: newRecord,
    });
  } catch (error) {
    console.error("Error adding book record:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
export default addBookRecord;