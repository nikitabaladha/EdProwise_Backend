import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const getAllClassSubjects = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    const records = await ClassSubject.find({ schoolId, academicYear }).sort({
      createdAt: -1,
    });

    return res.json({ hasError: false, data: records });
  } catch (error) {
    console.error("Error fetching class subjects:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default getAllClassSubjects;
