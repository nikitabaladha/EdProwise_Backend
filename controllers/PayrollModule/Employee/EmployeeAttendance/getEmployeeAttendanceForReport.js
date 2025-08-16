import EmployeeAttendance from "../../../../models/PayrollModule/Employee/EmployeeAttendance.js";
import moment from "moment";

const getEmployeeAttendanceForReport = async (req, res) => {
  const { schoolId, employeeId } = req.params;
  const { month, from, to } = req.query;

  if (!schoolId || !employeeId) {
    return res.status(400).json({ hasError: true, message: "Missing schoolId or employeeId" });
  }

  try {
    const attendanceRecord = await EmployeeAttendance.findOne({ schoolId, employeeId });

    if (!attendanceRecord || !attendanceRecord.attendance) {
      return res.status(200).json({ hasError: false, data: [] });
    }

    // Flatten all months into a single array
    let allRecords = [];

    for (const [monthKey, entries] of attendanceRecord.attendance.entries()) {
      allRecords.push(...entries);
    }

    // Filter logic
    if (month) {
      allRecords = allRecords.filter(entry =>
        moment(entry.date).format("YYYY-MM") === month
      );
    }

    if (from && to) {
      const fromDate = moment(from, "YYYY-MM-DD");
      const toDate = moment(to, "YYYY-MM-DD");
      allRecords = allRecords.filter(entry =>
        moment(entry.date).isBetween(fromDate, toDate, "day", "[]")
      );
    }

    // Sort by date ascending
    allRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({ hasError: false, data: allRecords });
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    res.status(500).json({ hasError: true, message: "Server error fetching attendance report" });
  }
};

export default getEmployeeAttendanceForReport;
