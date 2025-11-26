import mongoose from "mongoose";

const boardRegistrationFeesSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassAndSection",
    required: true,
  },
  sectionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassAndSection",
      required: true,
    },
  ],
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
},{ timestamps: true });

export default mongoose.model("BoardRegistrationFees", boardRegistrationFeesSchema);