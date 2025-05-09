import mongoose from 'mongoose';

const oneTimeFeesSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      ref: 'School', 
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassAndSection', 
      required: true,
    },
    sectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassAndSection',
        required: true,
      },
    ],
    oneTimeFees: [
      {
        feesTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'FeesType', 
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true } 
);


const OneTimeFees = mongoose.model('OneTimeFees', oneTimeFeesSchema);
export default OneTimeFees;
