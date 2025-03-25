import mongoose from "mongoose";

const MainCategorySchema = new mongoose.Schema(
  {
    mainCategoryName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MainCategory", MainCategorySchema);
