import mongoose from 'mongoose';

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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('FeesManagementYear', FeesManagementYearSchema);
