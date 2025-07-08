import mongoose from 'mongoose';
import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

const updateAcademicHistoryById = async (req, res) => {
  const { academicHistoryId } = req.params;
  const { schoolId, masterDefineClass, section, masterDefineShift } = req.body;

 
  if (!academicHistoryId || !mongoose.isValidObjectId(academicHistoryId)) {
    return res.status(400).json({ hasError: true, message: 'Valid Academic History ID is required.' });
  }
  if (!masterDefineClass || !mongoose.isValidObjectId(masterDefineClass)) {
    return res.status(400).json({ hasError: true, message: 'Valid Class ID is required.' });
  }
  if (!section || !mongoose.isValidObjectId(section)) {
    return res.status(400).json({ hasError: true, message: 'Valid Section ID is required.' });
  }
  if (!masterDefineShift || !mongoose.isValidObjectId(masterDefineShift)) {
    return res.status(400).json({ hasError: true, message: 'Valid Shift ID is required.' });
  }

  try {
    const updatedForm = await AdmissionFormModel.findOneAndUpdate(
      { schoolId, 'academicHistory._id': academicHistoryId },
      {
        $set: {
          'academicHistory.$.masterDefineClass': masterDefineClass,
          'academicHistory.$.section': section,
          'academicHistory.$.masterDefineShift': masterDefineShift,
        },
      },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({
        hasError: true,
        message: `No admission form found with academic history ID: ${academicHistoryId}`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: 'Academic history updated successfully.',
      data: updatedForm,
    });
  } catch (err) {
    return res.status(500).json({
      hasError: true,
      message: `Error updating academic history: ${err.message}`,
    });
  }
};

export default updateAcademicHistoryById;