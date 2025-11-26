// import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";
// const generateQuestionSetId = () => {
//   const chars =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let id = "";
//   for (let i = 0; i < 9; i++) {
//     id += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return id;
// };

// const createOrUpdateQuestionSet = async (req, res) => {
//   try {
//     const {
//       schoolId,
//       academicYear,
//       classId,
//       subjectId,
//       duration,
//       questions,
//       passingMarks,
//     } = req.body;

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({
//         hasError: true,
//         message: "At least one question is required",
//       });
//     }

//     // Calculate totalMarks from question marks
//     const totalMarks = questions.reduce(
//       (sum, q) => sum + (Number(q.marks) || 0),
//       0
//     );

//     // Check for existing set
//     let existingSet = await QuestionSet.findOne({
//       schoolId,
//       academicYear,
//       classId,
//       subjectId,
//     });

//     if (existingSet) {
//       // Append new questions and update total marks
//       existingSet.questions.push(...questions);
//       existingSet.totalMarks += totalMarks;
//       existingSet.passingMarks = passingMarks; // overwrite if changed
//       await existingSet.save();

//       return res.status(200).json({
//         hasError: false,
//         message: "Questions added to existing set",
//         data: existingSet,
//       });
//     }

//     // Create new set if not exists
//     let newSetId = generateQuestionSetId();

//     // Ensure uniqueness
//     let idExists = await QuestionSet.findOne({ questionSetId: newSetId });
//     while (idExists) {
//       newSetId = generateQuestionSetId();
//       idExists = await QuestionSet.findOne({ questionSetId: newSetId });
//     }

//     const newSet = new QuestionSet({
//       schoolId,
//       academicYear,
//       questionSetId: newSetId,
//       classId,
//       subjectId,
//       duration,
//       totalMarks,
//       passingMarks,
//       questions,
//     });

//     await newSet.save();

//     res.status(201).json({
//       hasError: false,
//       message: "Question Set created successfully",
//       data: newSet,
//     });
//   } catch (error) {
//     console.error("Error creating question set:", error);
//     res.status(500).json({
//       hasError: true,
//       message: "Server error creating question set",
//     });
//   }
// };

// export default createOrUpdateQuestionSet;

import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";

const generateQuestionSetId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 9; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const createOrUpdateQuestionSet = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      classId,
      subjectId,
      duration,
      questions,
      passingMarks,
      isForAllSubjects, // ✅ new field from frontend
    } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "At least one question is required",
      });
    }

    // Calculate total marks
    const totalMarks = questions.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );

    // ✅ Build search query dynamically
    const searchQuery = {
      schoolId,
      academicYear,
      classId,
    };

    if (isForAllSubjects) {
      searchQuery.isForAllSubjects = true;
    } else {
      searchQuery.subjectId = subjectId;
    }

    // Check for existing set
    let existingSet = await QuestionSet.findOne(searchQuery);

    if (existingSet) {
      // Append new questions and update total marks
      existingSet.questions.push(...questions);
      existingSet.totalMarks += totalMarks;
      existingSet.passingMarks = passingMarks;
      existingSet.duration = duration;
      await existingSet.save();

      return res.status(200).json({
        hasError: false,
        message: "Questions added to existing set",
        data: existingSet,
      });
    }

    // Generate unique questionSetId
    let newSetId = generateQuestionSetId();
    let idExists = await QuestionSet.findOne({ questionSetId: newSetId });
    while (idExists) {
      newSetId = generateQuestionSetId();
      idExists = await QuestionSet.findOne({ questionSetId: newSetId });
    }

    const newSet = new QuestionSet({
      schoolId,
      academicYear,
      questionSetId: newSetId,
      classId,
      subjectId: isForAllSubjects ? null : subjectId, // store null for "all subjects"
      isForAllSubjects: Boolean(isForAllSubjects),
      duration,
      totalMarks,
      passingMarks,
      questions,
    });

    await newSet.save();

    res.status(201).json({
      hasError: false,
      message: "Question Set created successfully",
      data: newSet,
    });
  } catch (error) {
    console.error("Error creating question set:", error);
    res.status(500).json({
      hasError: true,
      message: "Server error creating question set",
    });
  }
};

export default createOrUpdateQuestionSet;
