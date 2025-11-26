import mongoose from "mongoose";

const { Schema } = mongoose;

const absentsmsTemplateSchema = new Schema(
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

    templateLabel: {
      type: String,
      required: true,
    },
    templateValue: {
      type: String,
      required: true,
    },
    templateTexts: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AbsentsmsTemplate", absentsmsTemplateSchema);

 