
import mongoose from 'mongoose';
import FeesType from "./FeesType.js";

const FeesManagementYearSchema = new mongoose.Schema(
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
          return /^\d{4}-\d{4}$/.test(v) && parseInt(v.split('-')[1]) - parseInt(v.split('-')[0]) === 1;
        },
        message: props => `${props.value} is not a valid academic year format (e.g., 2025-2026)`,
      },
    },
    startDate: {
      type: Date,
      default: function () {
        const startYear = parseInt(this.academicYear.split('-')[0]);
        return new Date(startYear, 3, 1); 
      },
      validate: {
        validator: function (v) {
          if (!v) return true;
          const startYear = parseInt(this.academicYear.split('-')[0]);
          return v.getFullYear() === startYear;
        },
        message: props => `Start date ${props.value} must be in the first year of the academic year`,
      },
    },
    endDate: {
      type: Date,
      default: function () {
        const endYear = parseInt(this.academicYear.split('-')[1]);
        return new Date(endYear, 2, 31); 
      },
      validate: {
        validator: function (v) {
          if (!v) return true; 
          const endYear = parseInt(this.academicYear.split('-')[1]);
          return v.getFullYear() === endYear;
        },
        message: props => `End date ${props.value} must be in the second year of the academic year`,
      },
    },
  },
  {
    timestamps: true,
  }
);
const ONE_TIME_FEES = [
  "Registration Fee",
  "Admission Fee",
  "Transfer Certificate Fee",
  "Board Exam Fee",
  "Board Registration Fee",
];

FeesManagementYearSchema.post("save", async function (doc, next) {
  try {
    const bulkOps = ONE_TIME_FEES.map(name => ({
      updateOne: {
        filter: {
          schoolId: doc.schoolId,
          academicYear: doc.academicYear,
          feesTypeName: name,
        },
        update: {
          $setOnInsert: {
            schoolId: doc.schoolId,
            academicYear: doc.academicYear,
            feesTypeName: name,
            groupOfFees: "One Time Fees",
          },
        },
        upsert: true,
        setDefaultsOnInsert: true,
      },
    }));

    await FeesType.bulkWrite(bulkOps);
    next();
  } catch (err) {
    if (err.code === 11000) return next();
    next(err);
  }
});

export default mongoose.model('FeesManagementYear', FeesManagementYearSchema);