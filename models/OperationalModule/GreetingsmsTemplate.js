// models/OperationalModule/GreetingTemplate.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const greetingTemplateSchema = new Schema(
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
    role: {
      type: String,
      enum: ["Student", "Employee"],
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

export default mongoose.model(
  "GreetingsmsTemplate",
  greetingTemplateSchema
);

 