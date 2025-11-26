import StudentAttendance from "../../../models/OperationalModule/StudentAttendance.js";

const getStudentAttendance = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      class: className,
      section,
      date,
    } = req.query;

    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }
    if (!academicYear) {
      return res
        .status(400)
        .json({ success: false, message: "academicYear is required" });
    }
    if (!className) {
      return res
        .status(400)
        .json({ success: false, message: "className is required" });
    }
    if (!section) {
      return res
        .status(400)
        .json({ success: false, message: "section is required" });
    }
    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "date is required" });
    }

    const targetDate = new Date(date);

    // Find records for this class-section
    const records = await StudentAttendance.find({
      schoolId,
      academicYear,
      class: className,
      section,
      "attendanceDetails.attendanceDate": targetDate,
    });

    const students = records.map((rec) => {
      const attendanceForDate = rec.attendanceDetails.find(
        (a) =>
          new Date(a.attendanceDate).toDateString() ===
          targetDate.toDateString()
      );

      return {
        admissionNumber: rec.admissionNumber,
        rollNo: rec.rollNo,
        studentName: rec.studentName,
        status: attendanceForDate ? attendanceForDate.status : "Not Marked",
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        schoolId,
        academicYear,
        class: className,
        section,
        date,
        students,
      },
    });
  } catch (error) {
    console.error("Error fetching class-section attendance:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default getStudentAttendance;
