import mongoose from 'mongoose';

const FineSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    feeType: {
      type: String,
      enum: ['fixed', 'percentage'],
      required: true,
    },
    frequency: {
      type: String,
      enum: ['Fixed', 'Daily', 'Monthly', 'Annually'],
      required: true,
    },
    value: {
      type: Number,
      required: true, 
    },
    maxCapFee: {
      type: Number, 
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Fine', FineSchema);
