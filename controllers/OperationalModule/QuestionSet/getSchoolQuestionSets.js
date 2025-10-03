import QuestionSet from "../../../models/OperationalModule/QuestionSet.js";
import ClassAndSection from "../../../models/FeesModule/Class&Section.js";
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import EntranceExamSubject from "../../../models/OperationalModule/EntranceExamSubject.js";
const getSchoolQuestionSets = async (req, res) => {
  try {
    const { schoolId, academicYear, className, subjectId } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    // Build the query for QuestionSet
    const query = {
      schoolId,
      academicYear,
    };

    if (className) {
      // First find the ClassAndSection document to get the ObjectId
      const classData = await ClassAndSection.findOne({
        schoolId,
        academicYear,
        className: className,
      });

      if (classData) {
        query.classId = classData._id;
      } else {
        // If class not found, return empty result
        return res.status(200).json({
          hasError: false,
          data: [],
          message: "No question sets found for the specified class",
        });
      }
    }

    // Handle subject filtering
    let subjectQuery = {};
    if (subjectId) {
      subjectQuery = {
        $or: [
          { subjectId: new mongoose.Types.ObjectId(subjectId) },
          { isForAllSubjects: true },
        ],
      };
    }

    const questionSets = await QuestionSet.find({ ...query, ...subjectQuery });

    // Populate class and subject names
    const result = await Promise.all(
      questionSets.map(async (set) => {
        // Get class name from ClassAndSection using the ObjectId
        const classData = await ClassAndSection.findOne({
          _id: set.classId,
          schoolId,
          academicYear,
        });

        let subjectName = "All Subjects";
        if (!set.isForAllSubjects && set.subjectId) {
          try {
            // For ClassSubject, we need to find by class name (string) not ObjectId
            const classNameFromClassData = classData?._id;

            if (classNameFromClassData) {
              // Find ClassSubject document for this class
              const classSubjectData = await EntranceExamSubject.findOne({
                schoolId,
                academicYear,
                classId: classNameFromClassData,
              });

              if (classSubjectData && classSubjectData.subjects) {
                // Find the specific subject within the subjects array
                const subject = classSubjectData.subjects.id(set.subjectId);
                if (subject) {
                  subjectName = subject.subjectName;
                }
              }
            }
          } catch (error) {
            console.error("Error finding subject:", error);
            subjectName = "Unknown Subject";
          }
        }

        return {
          _id: set._id,
          questionSetId: set.questionSetId,
          academicYear: set.academicYear,
          className: classData?.className || "Unknown Class",
          classSection: classData?.sections || [],
          subjectName,
          totalMarks: set.totalMarks,
          passingMarks: set.passingMarks,
          duration: set.duration,
          isForAllSubjects: set.isForAllSubjects,
          subjectId: set.subjectId,
          classId: set.classId,
        };
      })
    );

    res.status(200).json({
      hasError: false,
      data: result,
      message: "Question sets fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching question sets:", error);
    res.status(500).json({
      hasError: true,
      message: "Server error while fetching question sets",
    });
  }
};

export default getSchoolQuestionSets;