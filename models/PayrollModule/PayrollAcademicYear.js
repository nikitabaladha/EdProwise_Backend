import mongoose from "mongoose";

const PayrollAcademicYearSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          if (!/^\d{4}-\d{2}$/.test(v)) return false;
          const [startYear, endYearShort] = v.split("-");
          const start = parseInt(startYear, 10);
          const end = parseInt(startYear.slice(0, 2) + endYearShort, 10);
          return end - start === 1;
        },
        message: (props) =>
          `${props.value} is not a valid academic year format (e.g., 2025-26)`,
      },
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

// Prevent duplicate academicYear for same schoolId
PayrollAcademicYearSchema.index(
  { schoolId: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.model("PayrollAcademicYear", PayrollAcademicYearSchema);
