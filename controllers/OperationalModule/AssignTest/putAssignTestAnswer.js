import AssignTest from "../../../models/OperationalModule/AssignTest.js";

const putAssignTestAnswer = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      classId,
      registrationNumber,
      testLink,
      answers,
      isFinalSubmit,
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
        message:
          "schoolId, academicYear, classId, registrationNumber, and testLink are required",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        hasError: true,
        message: "Answers object is required",
      });
    }

    // Find the assigned test
    const assignTest = await AssignTest.findOne({
      schoolId,
      academicYear,
      classId,
      registrationNumber,
      "testDetails.testLink": testLink,
    });

    if (!assignTest) {
      return res.status(404).json({
        hasError: true,
        message: "Test not found for given details",
      });
    }

    // Find test detail object
    const testDetail = assignTest.testDetails.find(
      (t) => t.testLink === testLink
    );
    if (!testDetail) {
      return res.status(404).json({
        hasError: true,
        message: "Test detail not found",
      });
    }

    // Update answers
    for (const [questionId, selectedOption] of Object.entries(answers)) {
      const ansObj = testDetail.ansDetails.find(
        (ans) => ans.questionId.toString() === questionId
      );
      if (ansObj) {
        ansObj.studentAnswer = selectedOption; // Save selected option (A/B/C/D)
      }
    }

    // If final submit, calculate result
    if (isFinalSubmit) {
      let totalMarks = 0;
      let receiveMarks = 0;

      testDetail.ansDetails.forEach((q) => {
        totalMarks += q.marks;
        if (q.studentAnswer && q.studentAnswer === q.correctAnswer) {
          receiveMarks += q.marks;
        }
      });

      testDetail.receiveMarks = receiveMarks;
      testDetail.result =
        receiveMarks >= testDetail.passingMarks ? "Pass" : "Fail";
    }

    await assignTest.save();

    return res.status(200).json({
      hasError: false,
      message: isFinalSubmit
        ? "Test submitted successfully"
        : "Answer saved successfully",
      data: {
        receiveMarks: testDetail.receiveMarks,
        result: testDetail.result,
      },
    });
  } catch (error) {
    console.error("Error updating test answers:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
    });
  }
};

export default putAssignTestAnswer;
