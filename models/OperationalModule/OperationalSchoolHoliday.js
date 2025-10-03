// import mongoose from "mongoose";

// const holidayDetailSchema = new mongoose.Schema(
//   {
//     holidayDate: {
//       type: Date,
//       required: true,
//     },
//     holidayNames: [
//       {
//         type: String,
//         required: true,
//         trim: true,
//       },
//     ],
//   },
// );

// const OperationalSchoolHolidaySchema = new mongoose.Schema(
//   {
//     schoolId: {
//       type: String,
//       ref: "School",
//       required: true,
//     },
//     academicYear: {
//       type: String,
//       required: true,
//     },
//     holidayDetails: {
//       type: [holidayDetailSchema],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model(
//   "OperationalSchoolHoliday",
//   OperationalSchoolHolidaySchema
// );

import mongoose from "mongoose";
const { Schema } = mongoose;

const holidayDetailSchema = new Schema({
  holidayDate: { type: Date, required: true },
  holidayNames: { type: String, required: true, trim: true }, 
});

const OperationalSchoolHolidaySchema = new Schema(
  {
    schoolId: { type: String, ref: "School", required: true },
    academicYear: { type: String, required: true },
    holidayDetails: { type: [holidayDetailSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model(
  "OperationalSchoolHoliday",
  OperationalSchoolHolidaySchema
);
