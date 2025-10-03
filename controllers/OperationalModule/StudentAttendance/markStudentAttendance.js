import StudentAttendance from "../../../models/OperationalModule/StudentAttendance.js";

const markStudentAttendance = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      class: className,
      section,
      attendanceDate,
      attendanceData, // array of { admissionNumber, rollNo, studentName, status }
    } = req.body;

    if (
      !schoolId ||
      !academicYear ||
      !className ||
      !section ||
      !attendanceDate ||
      !attendanceData
    ) {
      return res.status(400).json({
        hasError: true,
        message: "Missing required fields",
      });
    }

    const formattedDate = new Date(attendanceDate);

    // Loop through all students and save attendance
    const bulkOperations = attendanceData.map((student) => ({
      updateOne: {
        filter: {
          schoolId,
          academicYear,
          class: className,
          section,
          admissionNumber: student.admissionNumber,
        },
        update: {
          $setOnInsert: {
            rollNo: student.rollNo,
            studentName: student.studentName,
            schoolId,
            academicYear,
            class: className,
            section,
            admissionNumber: student.admissionNumber,
          },
          $push: {
            attendanceDetails: {
              attendanceDate: formattedDate,
              status: student.status,
            },
          },
        },
        upsert: true, // if no record exists, create one
      },
    }));

    await StudentAttendance.bulkWrite(bulkOperations);

    return res.status(200).json({
      hasError: false,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while marking attendance",
    });
  }
};

export default markStudentAttendance;