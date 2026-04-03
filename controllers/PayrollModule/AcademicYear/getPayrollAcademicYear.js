import PayrollAcademicYear from "../../../models/PayrollModule/PayrollAcademicYear.js";

const getPayrollAcademicYear = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: "Missing 'schoolId' in request parameters.",
    });
  }
  try {
    const currentYear = new Date().getFullYear();
    const nextYearShort = String((currentYear + 1) % 100).padStart(2, "0");
    const currentAcademicYear = `${currentYear}-${nextYearShort}`;

    const existing = await PayrollAcademicYear.findOne({
      schoolId,
      academicYear: currentAcademicYear,
    });

    if (!existing) {
      await PayrollAcademicYear.create({
        schoolId,
        academicYear: currentAcademicYear,
      });
    }

    const academicYears = await PayrollAcademicYear.find({ schoolId }).sort({
      academicYear: 1,
    });

    res.status(200).json({
      hasError: false,
      message: "Academic years fetched successfully.",
      data: academicYears,
    });
  } catch (error) {
    res.status(500).json({
      hasError: true,
      message: "Server error while fetching academic years.",
    });
  }
};

export default getPayrollAcademicYear;
