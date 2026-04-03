import PayrollAcademicYear from "../../../models/PayrollModule/PayrollAcademicYear.js";

const createPayrollAcademicYear = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.body;
    console.log("schoolId", schoolId);
    console.log("academicYear", academicYear);
    if (!schoolId || !academicYear) {
      return res
        .status(400)
        .json({ message: "schoolId and academicYear are required" });
    }

    // Check if already exists
    const existing = await PayrollAcademicYear.findOne({
      schoolId,
      academicYear,
    });
    if (existing) {
      return res.status(409).json({
        message: `Academic year ${academicYear} already exists for this school.`,
      });
    }

    const newYear = await PayrollAcademicYear.create({
      schoolId,
      academicYear,
    });
    res
      .status(201)
      .json({ message: "Academic year created successfully", data: newYear });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate academic year for this school" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default createPayrollAcademicYear;
