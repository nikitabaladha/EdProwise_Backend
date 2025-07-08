import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "MasterDefineShift", required: true },
});

const ClassAndSectionSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true },
     academicYear: {
      type: String,
      required: true,
    },
    className: { type: String, required: true },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("ClassAndSection", ClassAndSectionSchema);
