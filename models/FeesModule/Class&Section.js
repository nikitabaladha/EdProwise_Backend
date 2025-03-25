import mongoose from "mongoose";

const MasterDefineClassSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
      unique: true,
    },
    numberOfSEctions: {},
  },
  { timestamps: true }
);

export default mongoose.model("MasterDefineClass", MasterDefineClassSchema);
