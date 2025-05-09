import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

export const getAcademicYearsBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: "Missing 'schoolId' in request parameters.",
    });
  }

  try {
    const academicYears = await FeesManagementYear.find({ schoolId }).sort({ academicYear: 1 });

    res.status(200).json({
      hasError: false,
      message: "Academic years fetched successfully.",
      data: academicYears,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: "Server error while fetching academic years.",
    });
  }
};

export default getAcademicYearsBySchoolId;
