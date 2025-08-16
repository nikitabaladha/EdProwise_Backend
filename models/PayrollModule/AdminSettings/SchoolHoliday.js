import mongoose from 'mongoose';

const schoolHolidaySchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  holidayName: { type: String, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('SchoolHoliday', schoolHolidaySchema);
