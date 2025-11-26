import StudentAttendance from "../../../models/OperationalModule/StudentAttendance.js";

const updateStudentAttendance = async (req, res) => {
  try {
    const { schoolId, academicYear, className, section, date, updates } =
      req.body;

    if (!schoolId) {
      return res.status(400).json({ message: "schoolId is required" });
    }
    if (!academicYear) {
      return res.status(400).json({ message: "academicYear is required" });
    }
    if (!className) {
      return res.status(400).json({ message: "className is required" });
    }
    if (!section) {
      return res.status(400).json({ message: "section is required" });
    }
    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "updates (array) is required" });
    }    

    const attendanceDate = new Date(date);

    for (const upd of updates) {
      await StudentAttendance.updateOne(
        {
          schoolId,
          academicYear,
          class: className,
          section,
          admissionNumber: upd.admissionNumber,
          "attendanceDetails.attendanceDate": attendanceDate,
        },
        {
          $set: {
            "attendanceDetails.$.status": upd.status,
          },
        }
      );
    }

    return res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export default updateStudentAttendance;
