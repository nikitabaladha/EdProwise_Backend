import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

const deleteAdmissionFormById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ hasError: true, message: 'Admission ID is required.' });
  }

  try {
    const deletedForm = await AdmissionFormModel.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({
        hasError: true,
        message: `No admission form found with ID: ${id}`
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Admission form deleted successfully.',
      deleted: deletedForm
    });
  } catch (err) {
    res.status(500).json({ hasError: true, message: err.message });
  }
};

export default deleteAdmissionFormById;
