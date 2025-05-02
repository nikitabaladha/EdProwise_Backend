import mongoose from "mongoose";

const roundToTwo = (num) => {
  const isArgString = typeof num === "string";
  if (isArgString) num = Number(num);
  return Math.round(num);
};

const CategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    edprowiseMargin: {
      type: Number,
      // required: true,
      required: false,
      set: roundToTwo,
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
