import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

const getAdmissionFormsBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({ hasError: true, message: 'School ID is required.' });
  }

  try {
    const forms = await AdmissionFormModel.find({ schoolId });

    if (!forms.length) {
      return res.status(404).json({
        hasError: true,
        message: `No admission forms found for school ID: ${schoolId}`
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Admission forms retrieved successfully.',
      data: forms
    });
  } catch (err) {
    res.status(500).json({ hasError: true, message: err.message });
  }
};

export default getAdmissionFormsBySchoolId;
