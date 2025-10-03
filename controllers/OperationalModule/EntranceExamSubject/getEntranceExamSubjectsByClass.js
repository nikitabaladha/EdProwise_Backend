import EntranceExamSubject from "../../../models/OperationalModule/EntranceExamSubject.js";

const getEntranceExamSubjects = async (req, res) => {
    try {
      const { schoolId, academicYear, classId} = req.query;
  
      if (!schoolId || !academicYear) {
        return res.status(400).json({
          hasError: true,
          message: "schoolId and academicYear are required",
        });
      }
  
      // Build query based on available filters
      let query = { schoolId, academicYear };
      if (classId) query.classId = classId;
    
      // Fetch subjects with populated class information
      const records = await EntranceExamSubject.find(query)
        .populate("classId", "className")
        .sort({ createdAt: -1 })
        .lean();
  
      const formattedRecords = records.map((record) => {
        return {
          ...record,
          className: record.classId?.className || null,
        };
      });
  
      return res.json({ hasError: false, data: formattedRecords });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ hasError: true, message: "Internal server error" });
    }
};

export default getEntranceExamSubjects;
