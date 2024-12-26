import mongoose from "mongoose";

const EnquiryCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0 },
});

export default mongoose.model("EnquiryCounter", EnquiryCounterSchema);