import mongoose from "mongoose";

const MasterDefineClassSchema = new mongoose.Schema(
  {
    masterDefineClassName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MasterDefineClass", MasterDefineClassSchema);
