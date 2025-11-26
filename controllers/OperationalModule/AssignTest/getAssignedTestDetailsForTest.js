import AssignTest from "../../../models/OperationalModule/AssignTest.js";

const getAssignedTestDetailsForTest = async (req, res) => {
  try {
    const { schoolId, academicYear, classId, registrationNumber, testLink } =
      req.query;

    if (
      !schoolId ||
      !academicYear ||
      !classId ||
      !registrationNumber ||
      !testLink
    ) {
      return res.status(400).json({
        hasError: true,
        message:
          "schoolId, academicYear, classId, registrationNumber, testLink are required",
      });
    }

    // Find the AssignTest document
    const assignedTest = await AssignTest.findOne({
      schoolId,
      academicYear,
      classId,
      registrationNumber,
      "testDetails.testLink": testLink,
    }).lean();

    if (!assignedTest) {
      return res.status(404).json({
        hasError: true,
        message: "Assigned test not found for the provided details",
      });
    }

    // Filter the matching test detail
    const testDetail = assignedTest.testDetails.find(
      (t) => t.testLink === testLink
    );

    if (!testDetail) {
      return res.status(404).json({
        hasError: true,
        message: "Test detail not found",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Test details fetched successfully",
      data: {
        ...testDetail,
        registrationNumber: assignedTest.registrationNumber,
        classId: assignedTest.classId,
        schoolId: assignedTest.schoolId,
        academicYear: assignedTest.academicYear,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned test details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
    });
  }
};
export default getAssignedTestDetailsForTest;

// import AssignTest from "../../../models/OperationalModule/AssignTest.js";

// const getAssignTestDetailsForTest = async (req, res) => {
//   try {
//     const { schoolId, academicYear, classId, registrationNumber, testLink } = req.query;

//     if (!schoolId || !academicYear || !classId || !registrationNumber || !testLink) {
//       return res.status(400).json({
//         hasError: true,
//         message: "schoolId, academicYear, classId, registrationNumber, and testLink are required",
//       });
//     }

//     // Find assigned test details (directly from AssignTest)
//     const assignTest = await AssignTest.findOne({
//       schoolId,
//       academicYear,
//       classId,
//       testLink,
//     });

//     if (!assignTest) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Test not found for given details",
//       });
//     }

//     // (Optional) Validate student is allowed for this test
//     if (assignTest.assignedStudents?.length > 0) {
//       const isAllowed = assignTest.assignedStudents.some(
//         (s) => s.registrationNumber === registrationNumber
//       );
//       if (!isAllowed) {
//         return res.status(403).json({
//           hasError: true,
//           message: "You are not authorized to take this test",
//         });
//       }
//     }

//     // Convert testDuration from minutes → HH:MM
//     const totalMinutes = assignTest.testDuration || 0;
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     const testDuration = `${hours.toString().padStart(2, "0")}:${minutes
//       .toString()
//       .padStart(2, "0")}`;

//     return res.status(200).json({
//       hasError: false,
//       data: {
//         testTitle: assignTest.testTitle,
//         testDuration,
//         ansDetails: assignTest.questions.map((q) => ({
//           questionId: q._id,
//           questionText: q.questionText,
//           options: q.options.map((o) => ({
//             optionLabel: o.optionLabel,
//             optionText: o.optionText,
//           })),
//         })),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching assigned test details:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal Server Error",
//     });
//   }
// };

// export default getAssignTestDetailsForTest;
