import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    mainCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategory",
      required: true,
    },
  },
  { timestamps: true }
);

CategorySchema.index({ mainCategoryId: 1, categoryName: 1 }, { unique: true });

export default mongoose.model("Category", CategorySchema);
