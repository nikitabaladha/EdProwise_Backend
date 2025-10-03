import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Counter schema for per-school book record numbering
 */
const bookRecordCounterSchema = new Schema({
  schoolId: { type: String, required: true, unique: true },
  bookRecordSeq: { type: Number, default: 0 },
});

export const BookRecordCounter = mongoose.model(
  "BookRecordNumberCounter",
  bookRecordCounterSchema
);

/**
 * Individual book detail schema
 */
const bookDetailSchema = new Schema({
  bookName: {
    type: String,
    required: true,
    trim: true,
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
  },
  publicationYear: {
    type: Number,
    required: true,
  },
  entryDate: {
    type: Date,
    required: true,
  },
  bookLocation: {
    type: String,
    required: true,
    trim: true,
  },
  recordNumber: {
    type: String,
    required: true,
    trim: true,
  },
});

/**
 * Book record schema
 * Stores all book details for a given school
 */
const bookRecordSchema = new Schema(
  {
    schoolId: {
      type: String,
      required: true,
      
    },
    bookDetails: {
      type: [bookDetailSchema],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("BookRecord", bookRecordSchema);
