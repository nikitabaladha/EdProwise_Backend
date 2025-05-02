import mongoose from 'mongoose';

const AdmissionPrefixSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['numeric', 'alphanumeric'],
      required: true,
    },
    value: {
      type: String,
    },
    prefix: {
      type: String, 
    },
    number: {
      type: Number, 
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AdmissionPrefix', AdmissionPrefixSchema);
