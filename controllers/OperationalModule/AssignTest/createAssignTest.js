// import AssignTest from "../../../models/OperationalModule/AssignTest.js";

// const createAssignTest = async (req, res) => {
//   try {
//     const {
//       schoolId,
//       academicYear,
//       registrationNumber,
//       className,
//       registrationDate,
//       link,
//       assignTest,
//     } = req.body;

//     if (!schoolId) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "schoolId is required" });
//     }
//     if (!academicYear) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "academicYear is required" });
//     }
//     if (!registrationNumber) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "registrationNumber is required" });
//     }
//     if (!link) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "link is required" });
//     }

//     const newAssignTest = new AssignTest({
//       schoolId,
//       academicYear,
//       registrationNumber,
//       className,
//       registrationDate,
//       link,
//       assignTest,

//     });

//     await newAssignTest.save();

//     res.status(201).json({
//       hasError: false,
//       message: "Assign Test created successfully",
//       data: newAssignTest,
//     });
//   } catch (error) {
//     console.error("Error creating assign test:", error);
//     res.status(500).json({
//       hasError: true,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export default createAssignTest;

// import AssignTest from "../../../models/OperationalModule/AssignTest.js";

// const generateTestLink = (length = 11) => {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

// export const createAssignTest = async (req, res) => {
//   try {
//     const {
//       schoolId,
//       academicYear,
//       classId,
//       registrationDate,
//       selectedStudents,
//       subjectId,
//       questionSetObjId,
//       questionSetId,
//       assignTest,
//     } = req.body;

//     if (
//       !schoolId ||
//       !academicYear ||
//       !classId ||
//       !selectedStudents ||
//       selectedStudents.length === 0
//     ) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Missing required fields or no students selected",
//       });
//     }
// console.log("selected Student",selectedStudents);

//     // Prepare bulk insert array
//     const assignTestsToInsert = selectedStudents.map((student) => ({
//       schoolId,
//       academicYear,
//       registrationNumber: student.registrationNumber,
//       classId,
//       registrationDate: student.registrationDate || new Date(),
//       testDetails: [
//         {
//           subjectId,
//           questionSetObjId,
//           questionSetId,
//           assignTest: assignTest || "Yes",
//           result: "Awaited",
//           receiveMarks: 0,
//           testLink: generateTestLink(),
//         },
//       ],
//     }));

//     // Insert all at once
//     const savedTests = await AssignTest.insertMany(assignTestsToInsert);

//     return res.status(201).json({
//       hasError: false,
//       message: "Assign Test(s) created successfully",
//       data: savedTests,
//     });
//   } catch (error) {
//     console.error("Error creating Assign Test:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal Server Error while creating Assign Test",
//       error: error.message,
//     });
//   }
// };

// export default createAssignTest;

// import AssignTest from "../../../models/OperationalModule/AssignTest.js";

// const generateTestLink = (length = 11) => {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

// export const createAssignTest = async (req, res) => {
//   try {
//     const {
//       schoolId,
//       academicYear,
//       classId,
//       registrationDate,
//       selectedStudents,
//       subjectId,
//       questionSetObjId,
//       questionSetId,
//       assignTest,
//     } = req.body;

//     if (
//       !schoolId ||
//       !academicYear ||
//       !classId ||
//       !selectedStudents ||
//       selectedStudents.length === 0
//     ) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Missing required fields or no students selected",
//       });
//     }

//     const bulkOperations = [];

//     for (const student of selectedStudents) {
//       // Check if student already exists
//       const existingStudent = await AssignTest.findOne({
//         schoolId,
//         academicYear,
//         registrationNumber: student.registrationNumber,
//         classId,
//       });

//       if (existingStudent) {
//         // Student exists, push new test details to existing array
//         bulkOperations.push({
//           updateOne: {
//             filter: {
//               schoolId,
//               academicYear,
//               registrationNumber: student.registrationNumber,
//               classId,
//             },
//             update: {
//               $push: {
//                 testDetails: {
//                   subjectId,
//                   questionSetObjId,
//                   questionSetId,
//                   ansDetails: [],
//                   assignTest: assignTest || "Yes",
//                   result: "Awaited",
//                   receiveMarks: 0,
//                   testLink: generateTestLink(),
//                 },
//               },
//             },
//           },
//         });
//       } else {
//         // Student doesn't exist, create new document
//         bulkOperations.push({
//           insertOne: {
//             document: {
//               schoolId,
//               academicYear,
//               registrationNumber: student.registrationNumber,
//               classId,
//               registrationDate: student.registrationDate || new Date(),
//               testDetails: [
//                 {
//                   subjectId,
//                   questionSetObjId,
//                   questionSetId,
//                   ansDetails: [],
//                   assignTest: assignTest || "Yes",
//                   result: "Awaited",
//                   receiveMarks: 0,
//                   testLink: generateTestLink(),
//                 },
//               ],
//             },
//           },
//         });
//       }
//     }

//     // Execute all operations in bulk
//     const result = await AssignTest.bulkWrite(bulkOperations);

//     return res.status(201).json({
//       hasError: false,
//       message: "Assign Test(s) created/updated successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Error creating Assign Test:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal Server Error while creating Assign Test",
//       error: error.message,
//     });
//   }
// };

// export default createAssignTest;

import mongoose from "mongoose";

import AssignTest from "../../../models/OperationalModule/AssignTest.js";
import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";

const generateTestLink = (length = 11) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

const createAssignTest = async (req, res) => {
  try {
    const {
      schoolId,

      academicYear,

      classId,

      selectedStudents,

      subjectId,

      questionSetObjId,

      questionSetId,

      assignTest,
    } = req.body;

    if (
      !schoolId ||
      !academicYear ||
      !classId ||
      !selectedStudents ||
      selectedStudents.length === 0 ||
      !subjectId ||
      !questionSetObjId ||
      !questionSetId
    ) {
      return res.status(400).json({
        hasError: true,

        message:
          "Missing required fields: schoolId, academicYear, classId, selectedStudents, subjectId, questionSetObjId, or questionSetId",
      });
    }

    const questionSet = await QuestionSet.findOne({
    _id: questionSetObjId,
    questionSetId,
    schoolId,
    academicYear,
    classId,
    subjectId,
    });

    if (!questionSet) {
      return res.status(404).json({
        hasError: true,

        message: "QuestionSet not found for the provided details",
      });
    }

    const bulkOperations = [];

    for (const student of selectedStudents) {
      if (!student.registrationNumber) {
        return res.status(400).json({
          hasError: true,

          message: "registrationNumber is required for each student",
        });
      }

      const ansDetails = questionSet.questions.map((question) => ({
      questionId: question._id,
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      studentAnswer: null,
      }));

      const testDetail = {
        subjectId,
        questionSetObjId,
        questionSetId,
        totalMarks: questionSet.totalMarks,
        passingMarks: questionSet.passingMarks,
        ansDetails,
        assignTest: assignTest || "Yes",
        result: "Awaited",
        receiveMarks: 0,
        testDuration: questionSet.duration,
        testLink: generateTestLink(),
      };

      const existingStudent = await AssignTest.findOne({
      schoolId,
      academicYear,
      registrationNumber: student.registrationNumber,
      classId,
      });

      if (existingStudent) {
        const testExists = existingStudent.testDetails.some(
          (test) =>
            test.subjectId.toString() === subjectId &&
            test.questionSetId === questionSetId
        );

        if (testExists) {
          return res.status(400).json({
            hasError: true,
            message: `Test already assigned for student ${student.registrationNumber}`,
          });
        }

        bulkOperations.push({
          updateOne: {
            filter: {
             schoolId,
             academicYear,
             registrationNumber: student.registrationNumber,
             classId,
            },

            update: {
              $push: {
                testDetails: testDetail,
              },
            },
          },
        });
      } else {
        bulkOperations.push({
          insertOne: {
            document: {
            schoolId,
            academicYear,
            registrationNumber: student.registrationNumber,
            classId,
            registrationDate: new Date(),
            testDetails: [testDetail],
            },
          },
        });
      }
    }

    const result = await AssignTest.bulkWrite(bulkOperations);

    return res.status(201).json({
    hasError: false,
    message: "Assign Test(s) created/updated successfully",
    data: result,
    });
  } catch (error) {
  console.error("Error creating Assign Test:", error);
  return res.status(500).json({
    hasError: true,
    message: "Internal Server Error while creating Assign Test",
    error: error.message,
    });
  }
};
export default createAssignTest;

// export const submitTest = async (req, res) => {
//   try {
//     const { assignTestId, testDetailId, answers } = req.body;

//     if (!assignTestId || !testDetailId || !answers || !Array.isArray(answers)) {
//       return res.status(400).json({
//         hasError: true,

//         message:
//           "Missing required fields: assignTestId, testDetailId, or answers (must be an array)",
//       });
//     }

//     const assignTest = await AssignTest.findById(assignTestId);

//     if (!assignTest) {
//       return res.status(404).json({
//         hasError: true,

//         message: "AssignTest not found",
//       });
//     }

//     const testDetail = assignTest.testDetails.id(testDetailId);

//     if (!testDetail) {
//       return res.status(404).json({
//         hasError: true,

//         message: "TestDetail not found",
//       });
//     }

//     if (testDetail.result !== "Awaited") {
//       return res.status(400).json({
//         hasError: true,
//         message: "Test already submitted",
//       });
//     }

//     let receiveMarks = 0;

//     for (const answer of answers) {
//       if (!answer.questionId || !answer.studentAnswer) {
//         return res.status(400).json({
//           hasError: true,

//           message: "Each answer must include questionId and studentAnswer",
//         });
//       }

//       const ansDetail = testDetail.ansDetails.id(answer.questionId);

//       if (!ansDetail) {
//         return res.status(404).json({
//           hasError: true,

//           message: `Question with ID ${answer.questionId} not found in test`,
//         });
//       }

//       if (!["A", "B", "C", "D"].includes(answer.studentAnswer)) {
//         return res.status(400).json({
//           hasError: true,

//           message: `Invalid studentAnswer for question ${answer.questionId}: must be A, B, C, or D`,
//         });
//       }

//       ansDetail.studentAnswer = answer.studentAnswer;

//       if (ansDetail.studentAnswer === ansDetail.correctAnswer) {
//         receiveMarks += ansDetail.marks;
//       }
//     }

//     testDetail.receiveMarks = receiveMarks;

//     testDetail.result =
//       receiveMarks >= testDetail.passingMarks ? "Pass" : "Fail";

//     await assignTest.save();

//     return res.status(200).json({
//       hasError: false,

//       message: "Test submitted successfully",

//       data: {
//         assignTestId,
//         testDetailId,
//         receiveMarks,
//         result: testDetail.result,
//       },
//     });
//   } catch (error) {
//     console.error("Error submitting test:", error);

//     return res.status(500).json({
//       hasError: true,
//       message: "Internal Server Error while submitting test",
//       error: error.message,
//     });
//   }
// };
