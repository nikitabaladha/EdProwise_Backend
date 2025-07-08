import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
import mongoose from 'mongoose';

const deleteAcademicHistoryById = async (req, res) => {
  const { academicHistoryId } = req.params;

  if (!academicHistoryId || !mongoose.isValidObjectId(academicHistoryId)) {
    return res.status(400).json({ hasError: true, message: 'Valid Academic History ID is required.' });
  }

  try {
    const updatedForm = await AdmissionFormModel.findOneAndUpdate(
      { 'academicHistory._id': academicHistoryId },
      { $pull: { academicHistory: { _id: academicHistoryId } } },
      { new: true }
    );

  
    if (!updatedForm) {
      return res.status(404).json({
        hasError: true,
        message: `No admission form found with academic history ID: ${academicHistoryId}`,
      });
    }


    if (updatedForm.academicHistory.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: 'Cannot delete the last academic history entry. At least one academic history is required.',
      });
    }

    return res.status(200).json({
      hasError: false,
      message: 'Academic history entry deleted successfully.',
      data: updatedForm,
    });
  } catch (err) {
    return res.status(500).json({
      hasError: true,
      message: `Error deleting academic history: ${err.message}`,
    });
  }
};

export default deleteAcademicHistoryById;