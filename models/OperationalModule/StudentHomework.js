import mongoose from "mongoose";

const { Schema } = mongoose;

const homeworkRowSchema = new Schema(
  {
   
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      default: null, 
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
);

const HomeworkSchema = new Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
    },
    className: {
      type: String,
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
    },
    homeworkDate: {
      type: Date,
      required: true,
    },
    homeworkRows: {
      type: [homeworkRowSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "At least one homework row is required",
      ],
    },
  },
  { timestamps: true }
);

HomeworkSchema.index({
  schoolId: 1,
  academicYear: 1,
  className: 1,
  sectionName: 1,
});

export default mongoose.model("StudentHomework", HomeworkSchema);
