import mongoose from "mongoose";

const payrollAcademicYearSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

payrollAcademicYearSchema.index(
  { schoolId: 1, academicYear: 1 },
  { unique: true }
);

const PayrollAcademicYear = mongoose.model(
  "PayrollAcademicYearSetting",
  payrollAcademicYearSchema
);

export default PayrollAcademicYear;
