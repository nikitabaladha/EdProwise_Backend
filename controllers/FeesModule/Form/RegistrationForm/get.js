import StudentRegistration from '../../../../models/FeesModule/RegistrationFormCopy.js';

const getRegistrationsBySchoolId = async (req, res) => {
  const { schoolId,academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: "Both School ID and Academic Year are required.",
    });
  }

  try {
    const students = await StudentRegistration.find({ schoolId,academicYear });

    res.status(200).json({
      hasError: false,
      message: 'Students fetched successfully.',
      students,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default getRegistrationsBySchoolId;
