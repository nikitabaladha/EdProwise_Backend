import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";
import EntranceExamSubject from "../../../models/OperationalModule/EntranceExamSubject.js";
const getClassSubjectsByClassName = async (req, res) => {
  try {
    const { schoolId, academicYear, classId } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    let query = { schoolId, academicYear };
    if (classId) query.classId = classId;
   
    const records = await EntranceExamSubject.find(query);
    return res.json({ hasError: false, data: records });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default getClassSubjectsByClassName;