// import mongoose from "mongoose";

// const ReportsTabSettingsSchema = new mongoose.Schema(
//   {
//     schoolId: {
//       type: String,
//       required: true,
//     },
//     tabType: {
//       type: String,
//       required: true,
//     },
//     inFields: [
//       {
//         id: {
//           type: String,
//           required: true,
//         },
//         label: {
//           type: String,
//           required: true,
//         },
//         isDefault: {
//           type: Boolean,
//           default: false,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );


// ReportsTabSettingsSchema.index({ schoolId: 1, tabType: 1 }, { unique: true });

// export default mongoose.model("ReportsTabSettings", ReportsTabSettingsSchema);

import mongoose from "mongoose";

const ReportsTabSettingsSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    tabType: {
      type: String,
      required: true,
    },
    inFields: [
      {
        id: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    outFields: [
      {
        id: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

ReportsTabSettingsSchema.index({ schoolId: 1, tabType: 1 }, { unique: true });

export default mongoose.model("ReportsTabSettings", ReportsTabSettingsSchema);