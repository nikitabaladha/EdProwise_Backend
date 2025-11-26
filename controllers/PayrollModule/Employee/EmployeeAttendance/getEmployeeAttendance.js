// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";

// const getEmployeeAttendance = async (req, res) => {
//   const { schoolId, employeeId } = req.params;

//   if (!schoolId || !employeeId) {
//     return res.status(400).json({ hasError: true, message: "Missing parameters" });
//   }

//   try {
//     const data = await EmployeeAttendance.findOne({ schoolId, employeeId });
//     return res.status(200).json({ hasError: false, data });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// export default getEmployeeAttendance;

// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
// import moment from "moment";

// const getEmployeeAttendance = async (req, res) => {
//   const { schoolId, employeeId } = req.params;

//   if (!schoolId || !employeeId) {
//     return res.status(400).json({ hasError: true, message: "Missing parameters" });
//   }

//   try {

//     let data = await EmployeeAttendance.findOne({ schoolId, employeeId });

//     if (!data) {
//       data = await EmployeeAttendance.create({ schoolId, employeeId, attendance: {} });
//     }

//     const attendance = data.attendance || {};
//     const today = moment();
//     const monthsToPrepopulate = 12; 
//     let changesMade = false;

//     for (let i = 0; i < monthsToPrepopulate; i++) {
//       const monthMoment = moment(today).subtract(i, 'months');
//       const monthKey = monthMoment.format("YYYY-MM");

//       if (!attendance.has(monthKey)) attendance.set(monthKey, []);

//       const entries = attendance.get(monthKey);
//       const existingDates = new Set(entries.map(e => e.date));

//       const startOfMonth = monthMoment.clone().startOf('month');
//       const endOfMonth = monthMoment.clone().endOf('month');

//       for (let date = startOfMonth.clone(); date.isBefore(endOfMonth); date.add(1, 'day')) {
//         if (date.day() === 0) {
//           const dateStr = date.format("YYYY-MM-DD");
//           if (!existingDates.has(dateStr)) {
//             entries.push({ date: dateStr, dateStatus: "weekend" });
//             changesMade = true;
//           }
//         }
//       }

//       attendance.set(monthKey, entries);
//     }

//     if (changesMade) {
//       data.markModified("attendance"); // ✅ Important: ensure Mongoose saves the map
//       await data.save();
//     }

//     return res.status(200).json({ hasError: false, data: { attendance: Object.fromEntries(data.attendance) } });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ hasError: true, message: "Server error" });
//   }
// };

// export default getEmployeeAttendance;

// import SchoolHoliday from "../../../../models/PayrollModule/schoolHolidayModel.js";
// import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
// import SchoolHoliday from "../../../../models/PayrollModule/AdminSetting/SchoolHoliday.js";
// import moment from "moment";

// const getEmployeeAttendance = async (req, res) => {
//   const { schoolId, employeeId } = req.params;

//   if (!schoolId || !employeeId) {
//     return res.status(400).json({ hasError: true, message: "Missing parameters" });
//   }

//   try {
//     let attendanceRecord = await EmployeeAttendance.findOne({ schoolId, employeeId });

//     if (!attendanceRecord) {
//       attendanceRecord = new EmployeeAttendance({
//         schoolId,
//         employeeId,
//         attendance: {},
//       });
//     }

//     // ✅ Step 1: Fetch all holidays for this school
//     const holidays = await SchoolHoliday.find({ schoolId }).lean();

//     if (holidays.length > 0) {
//       const groupedHolidays = {}; // { "2025-07": [ { date, name }, ... ] }

//       holidays.forEach(h => {
//         const date = moment(h.date).format("YYYY-MM-DD");
//         const key = moment(h.date).format("YYYY-MM");

//         if (!groupedHolidays[key]) groupedHolidays[key] = [];
//         groupedHolidays[key].push({ date, holidayName: h.holidayName });
//       });

//       let isModified = false;

//       // ✅ Step 2: Inject only missing holidays
//       for (const [monthKey, monthHolidays] of Object.entries(groupedHolidays)) {
//         const existingMonth = attendanceRecord.attendance.get(monthKey) || [];

//         const existingDates = new Set(
//           existingMonth
//             .filter(entry => entry.dateStatus === "holiday")
//             .map(entry => entry.date)
//         );

//         const newHolidays = monthHolidays
//           .filter(h => !existingDates.has(h.date))
//           .map(h => ({
//             date: h.date,
//             dateStatus: "holiday",
//             holidayName: h.holidayName,
//           }));

//         if (newHolidays.length > 0) {
//           attendanceRecord.attendance.set(monthKey, [...existingMonth, ...newHolidays]);
//           isModified = true;
//         }
//       }

//       if (isModified) {
//         await attendanceRecord.save();
//       }
//     }

//     res.status(200).json({ hasError: false, data: attendanceRecord });
//   } catch (err) {
//     console.error("Error fetching attendance:", err);
//     res.status(500).json({ hasError: true, message: "Failed to fetch attendance" });
//   }
// };

// export default getEmployeeAttendance;


import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
import SchoolHoliday from "../../../../models/PayrollModule/AdminSettings/SchoolHoliday.js";
import moment from "moment";

const getEmployeeAttendance = async (req, res) => {
  const { schoolId, employeeId } = req.params;

  if (!schoolId || !employeeId) {
    return res.status(400).json({ hasError: true, message: "Missing parameters" });
  }

  try {
    let attendanceRecord = await EmployeeAttendance.findOne({ schoolId, employeeId });

    if (!attendanceRecord) {
      attendanceRecord = new EmployeeAttendance({
        schoolId,
        employeeId,
        attendance: {},
      });
    }

    const currentYear = moment().year();

    
    const holidays = await SchoolHoliday.find({ schoolId }).lean();

    const groupedHolidays = {}; // { "YYYY-MM": [ { date, holidayName }, ... ] }
    holidays.forEach(h => {
      const date = moment(h.date).format("YYYY-MM-DD");
      const key = moment(h.date).format("YYYY-MM");
      if (!groupedHolidays[key]) groupedHolidays[key] = [];
      groupedHolidays[key].push({ date, holidayName: h.holidayName });
    });

    let isModified = false;

    for (const [monthKey, monthHolidays] of Object.entries(groupedHolidays)) {
      const existingMonth = attendanceRecord.attendance.get(monthKey) || [];

      const existingHolidayDates = new Set(
        existingMonth.filter(entry => entry.dateStatus === "holiday").map(entry => entry.date)
      );

      const newHolidays = monthHolidays
        .filter(h => !existingHolidayDates.has(h.date))
        .map(h => ({
          date: h.date,
          dateStatus: "holiday",
          holidayName: h.holidayName
        }));

      if (newHolidays.length > 0) {
        attendanceRecord.attendance.set(monthKey, [...existingMonth, ...newHolidays]);
        isModified = true;
      }
    }

    const monthsToProcess = new Set([
      ...Object.keys(groupedHolidays),
      ...Object.keys(attendanceRecord.attendance.toObject()) 
    ]);

    for (const monthKey of monthsToProcess) {
      const [year, month] = monthKey.split("-").map(Number);
      const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

      const existingMonth = attendanceRecord.attendance.get(monthKey) || [];
      const existingWeekendDates = new Set(
        existingMonth.filter(entry => entry.dateStatus === "weekend").map(entry => entry.date)
      );

      const sundayEntries = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = moment({ year, month: month - 1, day });
        const formatted = date.format("YYYY-MM-DD");
        if (date.day() === 0 && !existingWeekendDates.has(formatted)) {
          sundayEntries.push({
            date: formatted,
            dateStatus: "weekend"
          });
        }
      }

      if (sundayEntries.length > 0) {
        attendanceRecord.attendance.set(monthKey, [...existingMonth, ...sundayEntries]);
        isModified = true;
      }
    }

    
    if (isModified) {
      await attendanceRecord.save();
    }

    res.status(200).json({ hasError: false, data: attendanceRecord });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ hasError: true, message: "Failed to fetch attendance" });
  }
};

export default getEmployeeAttendance;
