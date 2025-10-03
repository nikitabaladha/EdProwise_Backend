import AssignTest from "../../../models/OperationalModule/AssignTest.js";
import RegistrationForm from "../../../models/FeesModule/RegistrationFormCopy.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
const getTestByLink = async (req, res) => {
  try {
    const { testLink } = req.params;

    if (!testLink) {
      return res.status(400).json({
        hasError: true,
        message: "Test link is required",
      });
    }

    const assignTestDoc = await AssignTest.findOne({
      "testDetails.testLink": testLink,
    }).lean();

    if (!assignTestDoc) {
      return res.status(404).json({
        hasError: true,
        message: "Test link not found. Please check the link.",
      });
    }
console.log("assignTestDoc",assignTestDoc);

    const matchedTest = assignTestDoc.testDetails.find(
      (td) => td.testLink === testLink
    );

    console.log("matchedTest", matchedTest);
    

    if (!matchedTest) {
      return res.status(404).json({
        hasError: true,
        message: "Test details not found for this link.",
      });
    }

// if (matchedTest.result !== "Awaited") {
//   return res.status(200).json({
//     hasError: false,
//     alreadyAttempted: true,
//     message: `You have already given this test. Result: ${matchedTest.result.status}`,
//     data: {
//       result: matchedTest.result,
//     },
//   });
// }

    const student = await RegistrationForm.findOne({
      schoolId: assignTestDoc.schoolId,
      academicYear: assignTestDoc.academicYear,
      registrationNumber: assignTestDoc.registrationNumber,
    }).lean();

    if (!student) {
      return res.status(404).json({
        hasError: true,
        message: "Student registration details not found.",
      });
    }

        let className = null;
       
        if (student.masterDefineClass) {
          const classDoc = await ClassAndSection.findById(
            student.masterDefineClass
          );
    
          if (classDoc) {
            className = classDoc.className;
          }
        }
    

    const rawResult = matchedTest.result;
    let resultStatus = "Awaited";

    if (rawResult !== undefined && rawResult !== null) {
      if (typeof rawResult === "string") {
        resultStatus = rawResult;
      } else if (typeof rawResult === "object" && rawResult.status) {
        resultStatus = rawResult.status;
      } else {
        // fallback — stringify or mark as Completed
        resultStatus =
          typeof rawResult === "object"
            ? JSON.stringify(rawResult)
            : String(rawResult);
      }
    }

    const attempted =
      typeof resultStatus === "string" &&
      resultStatus.trim().toLowerCase() !== "awaited";


    // res.status(200).json({
    //   hasError: false,
    //   message: "Test and student details fetched successfully",
    //   data: {
    //     schoolId: assignTestDoc.schoolId,
    //     academicYear: assignTestDoc.academicYear,
    //     registrationNumber: assignTestDoc.registrationNumber,
    //     classId: assignTestDoc.classId,
    //     firstName: student.firstName,
    //     middleName: student.middleName,
    //     lastName: student.lastName,
    //     studentProfile: student.studentPhoto || null,
    //     className,
    //     testDetails: matchedTest,
    //     result: matchedTest.result ?? null,
    //   },

      
    // });
  
  const payload = {
    schoolId: assignTestDoc.schoolId,
    academicYear: assignTestDoc.academicYear,
    registrationNumber: assignTestDoc.registrationNumber,
    classId: assignTestDoc.classId,
    firstName: student.firstName,
    middleName: student.middleName,
    lastName: student.lastName,
    studentProfile: student.studentPhoto || null,
    className,
    testDetails: matchedTest, // includes questions, result, etc.
    result: matchedTest.result ?? null,
  };

  if (attempted) {
    // If already attempted, still return student/test info + result flag
    return res.status(200).json({
      hasError: false,
      alreadyAttempted: true,
      message: `You have already given this test. Result: ${resultStatus}`,
      data: payload,
    });
  }

  // Not attempted — return full data so frontend can start exam
  return res.status(200).json({
    hasError: false,
    alreadyAttempted: false,
    message: "Test and student details fetched successfully",
    data: payload,
  });
  } catch (error) {
    console.error("GET TEST BY LINK ERROR:", error);
    res.status(500).json({ hasError: true, message: "Server error", error });
  }
};

export default getTestByLink;