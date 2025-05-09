// models/FeesModule/FeesStructure.js
import mongoose from "mongoose";

const feesSchema = new mongoose.Schema({
  feesTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeesType",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const installmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  fees: [feesSchema], 
});

const feesStructureSchema = new mongoose.Schema({
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
    ref: "Class",
    required: true,
  },
  sectionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
  ],
  installments: [installmentSchema],
});

export default mongoose.model("FeesStructure", feesStructureSchema);
