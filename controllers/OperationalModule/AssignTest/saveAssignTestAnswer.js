// controllers/OperationalModule/saveAssignTestAnswer.js
import AssignTest from "../../../models/OperationalModule/AssignTest.js";

const saveAssignTestAnswer = async (req, res) => {
    console.log("for save answer");
    
  try {
    const {
      schoolId,
      academicYear,
      classId,
      registrationNumber,
      testLink,
      answers,
    } = req.body;

console.log(answers,"Save Test");

    if (
      !schoolId ||
      !academicYear ||
      !classId ||
      !registrationNumber ||
      !testLink
    ) {
      return res
        .status(400)
        .json({ hasError: true, message: "Missing required fields" });
    }

    const assignTest = await AssignTest.findOne({
      schoolId,
      academicYear,
      classId,
      registrationNumber,
      "testDetails.testLink": testLink,
    });

    if (!assignTest) {
      return res
        .status(404)
        .json({ hasError: true, message: "Assigned test not found" });
    }

    // assignTest.answers = {
    //   ...assignTest.answers,
    //   ...answers,
    // };

     const testDetail = assignTest.testDetails.find(
       (td) => td.testLink === testLink
     );

     if (!testDetail) {
       return res.status(404).json({
         hasError: true,
         message: "Test details not found for given testLink",
       });
     }


     Object.entries(answers).forEach(([questionId, studentAns]) => {
       const question = testDetail.ansDetails.find(
         (q) => q.questionId.toString() === questionId
       );
       if (question) {
         question.studentAnswer = studentAns; // ✅ Correctly updates inside nested array
       }
     });
    await assignTest.save();

    return res.status(200).json({
      hasError: false,
      message: "Answer saved successfully",
      data: testDetail.ansDetails.map((q) => ({
        questionId: q.questionId,
        studentAnswer: q.studentAnswer,
      })),
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default saveAssignTestAnswer;
