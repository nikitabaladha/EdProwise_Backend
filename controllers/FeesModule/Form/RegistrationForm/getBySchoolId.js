import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';

const getRegistrationsBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: 'Missing schoolId in request parameters.',
    });
  }

  try {
    const students = await StudentRegistration.find({ schoolId });

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
