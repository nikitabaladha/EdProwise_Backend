import AssignTest from "../../../models/OperationalModule/AssignTest.js";
import StudentRegistration from "../../../models/FeesModule/RegistrationForm.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const getAssignedTests = async (req, res) => {
  try {
    const { schoolId, academicYear, classId, subjectId } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    // 1. Fetch assigned tests with filters
    const query = { schoolId, academicYear };
    if (classId) query.classId = classId;

    // This will get all assignTests with testDetails, and we filter for subjectId if provided
    const assignedTests = await AssignTest.find(query).lean();

    if (!assignedTests.length) {
      return res.status(404).json({
        hasError: true,
        message: "No assigned tests found",
        data: [],
      });
    }

    // 2. Fetch all related Students, Classes, Subjects in bulk (to avoid N+1 queries)
    const registrationNumbers = assignedTests.map((t) => t.registrationNumber);
    const students = await StudentRegistration.find({
      schoolId,
      academicYear,
      registrationNumber: { $in: registrationNumbers },
    })
      .select(
        "_id registrationNumber firstName middleName lastName masterDefineClass section"
      )
      .lean();

    const classIds = [...new Set(students.map((s) => s.masterDefineClass))];
    const classes = await ClassAndSection.find({
      _id: { $in: classIds },
    }).lean();

    // Get all subjectIds used in testDetails
    const allSubjectIds = [
      ...new Set(
        assignedTests.flatMap((test) =>
          test.testDetails.map((td) => td.subjectId.toString())
        )
      ),
    ];
    const subjects = await ClassSubject.find({
      schoolId,
      academicYear,
      _id: { $in: allSubjectIds },
    }).lean();

    // 3. Build response
    const result = [];

    for (const test of assignedTests) {
      const student = students.find(
        (s) => s.registrationNumber === test.registrationNumber
      );
      if (!student) continue;

      const classDoc = classes.find(
        (c) => c._id.toString() === student.masterDefineClass?.toString()
      );
      const className = classDoc?.className || null;
      const sectionName = classDoc?.sections?.id(student.section)?.name || null;

      // Filter testDetails by subjectId (if provided)
      const filteredTestDetails = subjectId
        ? test.testDetails.filter(
            (td) => td.subjectId.toString() === subjectId.toString()
          )
        : test.testDetails;

      // Map each testDetail into a proper response
      for (const td of filteredTestDetails) {
        const subjectDoc = subjects.find(
          (sub) => sub._id.toString() === td.subjectId.toString()
        );
        result.push({
          _id: test._id,
          registrationNumber: student.registrationNumber,
          studentName: `${student.firstName} ${student.middleName || ""} ${
            student.lastName
          }`.trim(),
          classId: student.masterDefineClass,
          className,
          sectionName,
          subjectId: td.subjectId,
          subjectName: subjectDoc?.subjectName || "Unknown Subject",
          questionSetId: td.questionSetId,
          assignTest: td.assignTest,
          result: td.result,
          receiveMarks: td.receiveMarks,
          testLink: td.testLink,
          createdAt: test.createdAt,
        });
      }
    }

    res.status(200).json({
      hasError: false,
      message: "Assigned tests fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching assigned tests:", error);
    res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getAssignedTests;
