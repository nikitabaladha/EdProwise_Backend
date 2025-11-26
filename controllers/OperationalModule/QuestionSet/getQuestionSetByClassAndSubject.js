import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";

const getQuestionSetByClassAndSubject = async (req, res) => {
  try {
    const { schoolId, academicYear, classId, subjectId } = req.query;

    if (!schoolId || !academicYear || !classId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId, academicYear, and classId are required",
      });
    }
   
    const orQuery = [];
    if (subjectId && subjectId !== "null") {
      orQuery.push({ subjectId });
     
    }

    if (subjectId === null) {
      orQuery.push({ isForAllSubjects: true }); 
    }
    
    const query = {
      schoolId,
      academicYear,
      classId,
      $or: orQuery,
      
    };

    const questionSet = await QuestionSet.findOne(query)
      .populate("classId", "className sectionName")
      .populate("subjectId", "subjectName");

    if (!questionSet) {
      return res.status(200).json({
        hasError: false,
        data: null,
        message: "No question set available for selected class and subject",
      });
    }

    return res.status(200).json({
      hasError: false,
      data: questionSet,
      message: "Question set found successfully",
    });
  } catch (error) {
    console.error("Error fetching question set:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching question set",
    });
  }
};

export default getQuestionSetByClassAndSubject;
