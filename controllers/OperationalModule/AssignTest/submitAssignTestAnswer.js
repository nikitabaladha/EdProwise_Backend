
import AssignTest from "../../../models/OperationalModule/AssignTest.js";

const submitAssignTestAnswer = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      classId,
      registrationNumber,
      testLink,
      answers,
    } = req.body;

    if (
      !schoolId ||
      !academicYear ||
      !classId ||
      !registrationNumber ||
      !testLink
    ) {
      return res.status(400).json({
        hasError: true,
        message: "Missing required fields",
      });
    }

    // ✅ Find the assigned test first
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

    // ✅ Locate correct test detail
    const testDetail = assignTest.testDetails.find(
      (td) => td.testLink === testLink
    );

    if (!testDetail) {
      return res
        .status(404)
        .json({
          hasError: true,
          message: "No test details found for this testLink",
        });
    }

    // ✅ Update student answers if provided
    if (answers && typeof answers === "object") {
      for (const [questionId, selectedAnswer] of Object.entries(answers)) {
        const q = testDetail.ansDetails.find(
          (ans) => ans.questionId.toString() === questionId
        );
        if (q) {
          q.studentAnswer = selectedAnswer;
        }
      }
    }

    // ✅ Calculate obtained marks
    let obtainedMarks = 0;
    testDetail.ansDetails.forEach((q) => {
      if (q.studentAnswer && q.studentAnswer === q.correctAnswer) {
        obtainedMarks += q.marks;
      }
    });

    // ✅ Update result
    testDetail.receiveMarks = obtainedMarks;
    testDetail.result =
      obtainedMarks >= testDetail.passingMarks ? "Pass" : "Fail";

    await assignTest.save();

    return res.status(200).json({
      hasError: false,
      message: "Test submitted successfully",
      data: {
        totalQuestions: testDetail.ansDetails.length,
        attemptedQuestions: testDetail.ansDetails.filter((q) => q.studentAnswer)
          .length,
        obtainedMarks,
        totalMarks: testDetail.totalMarks,
        resultStatus: testDetail.result,
      },
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default submitAssignTestAnswer;
