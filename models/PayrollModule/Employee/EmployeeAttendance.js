// import mongoose from "mongoose";

// const AttendanceDaySchema = new mongoose.Schema({
//   date: { type: String, required: true }, 
//   dateStatus: {
//     type: String,
//     enum: ["present", "leave", "weekend", "absent"],
//     required: true,
//   },
// });

// const EmployeeAttendanceSchema = new mongoose.Schema({
//   schoolId: { type: String, required: true },
//   employeeId: { type: String, required: true },
//   attendance: {
//     type: Map,
//     of: [AttendanceDaySchema], 
//     default: {},
//   },
// });

// export default mongoose.model("EmployeeAttendance", EmployeeAttendanceSchema);

// models/PayrollModule/Employee/EmployeeAttendance.js
import mongoose from "mongoose";

const attendanceEntrySchema = new mongoose.Schema({
  date: { type: String, required: true }, 
  dateStatus: { type: String, enum: ["present", "leave", "weekend","holiday","applied-leave","rejected-leave"], required: true },
  inTime: { type: String },
  outTime: { type: String },
  holidayName: { type: String } 
}, { _id: false });

const employeeAttendanceSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  employeeId: { type: String, required: true },
  attendance: {
    type: Map,
    of: [attendanceEntrySchema],
    default: {}
  }
}, { timestamps: true });

export default mongoose.model("EmployeeAttendance", employeeAttendanceSchema);
