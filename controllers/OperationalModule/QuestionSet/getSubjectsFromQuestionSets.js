import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import EntranceExamSubject from "../../../models/OperationalModule/EntranceExamSubject.js";
const getSubjectsFromQuestionSets = async (req, res) => {
  //   try {
  //     const { schoolId, academicYear, classId } = req.query;

  //     if (!schoolId || !academicYear || !classId) {
  //       return res.status(400).json({
  //         hasError: true,
  //         message: "schoolId, academicYear and classId are required",
  //       });
  //     }

  //     // Find all question sets for given class
  //     const questionSets = await QuestionSet.find({
  //       schoolId,
  //       academicYear,
  //       classId,
  //     }).select("subjectId");

  //     if (!questionSets.length) {
  //       return res.status(200).json({
  //         hasError: false,
  //         message: "No question sets found for this class",
  //         data: [],
  //       });
  //     }

  //     // Extract unique subjectIds
  //     const uniqueSubjectIds = [
  //       ...new Set(questionSets.map((qs) => qs.subjectId?.toString())),
  //     ].filter(Boolean);

  //     // Fetch subject names from ClassSubject collection
  //     const subjects = await ClassSubject.find({
  //       schoolId,
  //       academicYear,
  //       classId,
  //       _id: { $in: uniqueSubjectIds },
  //     }).select("_id subjectName");

  //     // Format for CreatableSelect
  //     const formattedSubjects = subjects.map((s) => ({
  //       value: s._id,
  //       label: s.subjectName,
  //     }));

  //     res.status(200).json({
  //       hasError: false,
  //       message: "Subjects fetched successfully",
  //       data: formattedSubjects,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching subjects from question sets", error);
  //     res.status(500).json({
  //       hasError: true,
  //       message: "Internal server error while fetching subjects",
  //     });
  //   }
  // };

  try {
    const { schoolId, academicYear, classId, className } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId are required",
      });
    }

    if (!academicYear ) {
      return res.status(400).json({
        hasError: true,
        message: " academicYear are required",
      });
    }

    if (!classId) {
      return res.status(400).json({
        hasError: true,
        message: "classId are required",
      });
    }

    if (!className) {
      return res.status(400).json({
        hasError: true,
        message: "class name are required",
      });
    }

    // 1️⃣ Get all question sets for this class, school, and academic year
    const questionSets = await QuestionSet.find({
      schoolId,
      academicYear,
      classId,
    }).lean();

    if (!questionSets.length) {
      return res.status(200).json({
        hasError: false,
        data: [],
        message: "No question sets found for this class",
      });
    }

    // 2️⃣ Extract unique subjectIds and check for isForAllSubjects
    const subjectIds = [];
    let hasAllSubjects = false;

    questionSets.forEach((qs) => {
      if (qs.isForAllSubjects) {
        hasAllSubjects = true;
      } else if (qs.subjectId) {
        subjectIds.push(qs.subjectId.toString());
      }
    });

    const uniqueSubjectIds = [...new Set(subjectIds)];

    // 3️⃣ Get ClassSubject document to find subject names
    const classSubjectDoc = await EntranceExamSubject.findOne({
      schoolId,
      academicYear,
      classId: classId,
    }).lean();
       
    if (!classSubjectDoc) {
      return res.status(404).json({
        hasError: true,
        message: "ClassSubject not found for given classId",
      });
    }

    // 4️⃣ Build response: match subjectId with subjectName
    let subjectList = [];

    if (hasAllSubjects) {
      subjectList.push({
        subjectId: null,
        subjectName: "All Subjects",
      });
    }

    if (uniqueSubjectIds.length > 0) {
      subjectList = subjectList.concat(
        classSubjectDoc.subjects
          .filter((sub) => uniqueSubjectIds.includes(sub._id.toString()))
          .map((sub) => ({
            subjectId: sub._id,
            subjectName: sub.subjectName,
          }))
      );
    }

    return res.status(200).json({
      hasError: false,
      data: subjectList,
      message: "Subjects fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching question set subjects:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
    });
  }
};

export default getSubjectsFromQuestionSets;