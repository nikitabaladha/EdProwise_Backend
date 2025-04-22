// import mongoose from "mongoose";

// const SectionSchema = new mongoose.Schema(
//   {
//     sectionName: {
//       type: String,
//       required: true,
//       unique: true,

//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Section", SectionSchema);

import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Section", SectionSchema);
