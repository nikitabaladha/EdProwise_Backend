import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';

const deleteStudentById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      hasError: true,
      message: 'Missing student ID in request parameters.',
    });
  }

  try {
    const deletedStudent = await StudentRegistration.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        hasError: true,
        message: 'Student not found.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Student deleted successfully.',
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default deleteStudentById;
