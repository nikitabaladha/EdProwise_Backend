import mongoose from "mongoose";

const CTCComponentSchema = new mongoose.Schema({
  ctcComponentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PayrollCtcComponents",
    required: true,
  },
  ctcComponentName: {
    type: String,
    required: true,
  },
  annualAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  applicableDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const EmployeeCTCSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true },
    employeeId: { type: String, required: true },
    academicYear: { type: String, required: true },
    components: [CTCComponentSchema],
    totalAnnualCost: { type: Number, required: true, min: 0 },
    applicableDate: { type: Date, required: true, default: Date.now },
    history: [
      {
        components: [CTCComponentSchema],
        totalAnnualCost: { type: Number, required: true, min: 0 },
        applicableDate: { type: Date, required: true },
        updatedAt: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const EmployeeCTC = mongoose.model("EmployeeCTC", EmployeeCTCSchema);
export default EmployeeCTC;