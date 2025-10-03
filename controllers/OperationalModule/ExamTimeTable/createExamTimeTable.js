import ExamTimeTable from "../../../models/OperationalModule/ExamTimeTable.js";
const createExamTimeTable = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      className,
      sectionName,
      examName,
      examDetails,
    } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required",
      });
    }

    if (!academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "Academic Year is required",
      });
    }

    if (!className) {
      return res.status(400).json({
        hasError: true,
        message: "Class Name is required",
      });
    }

    if (!sectionName) {
      return res.status(400).json({
        hasError: true,
        message: "Section Name is required",
      });
    }

    if (!examName) {
      return res.status(400).json({
        hasError: true,
        message: "Exam Name is required",
      });
    }


    if (!Array.isArray(examDetails) || examDetails.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "Exam details must be provided",
      });
    }

    const newExamTimeTable = new ExamTimeTable({
      schoolId,
      academicYear,
      className,
      sectionName,
      examName,
      examDetails,
    });

    await newExamTimeTable.save();

    res.status(201).json({
      hasError: false,
      message: "Exam timetable created successfully",
      data: newExamTimeTable,
    });
  } catch (error) {
    console.error("Error creating exam timetable:", error);
    res.status(500).json({
      hasError: true,
      message: "Server error while creating exam timetable",
    });
  }
};
export default createExamTimeTable;