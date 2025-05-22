import mongoose from 'mongoose';
import fs from 'fs';
import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';
import { ConcessionFormValidator } from '../../../../validators/FeesModule/ConcessionValidator/ConcessionFormvalidator.js';

const getConcessionFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/Concession/${file.filename}`
    : `/Documents/Concession/${file.filename}`;
};

const updateConcessionForm = async (req, res) => {
  const schoolId = req.user?.schoolId;
  const { id } = req.params;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.'
    });
  }

  const newCertificateFile = req.files?.castOrIncomeCertificate?.[0];
  const newPhotoFile = req.files?.studentPhoto?.[0];
  const newCertificatePath = newCertificateFile?.path;
  const newPhotoPath = newPhotoFile?.path;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingForm = await ConcessionFormModel.findOne({ _id: id, schoolId }).session(session);

    if (!existingForm) {
      if (newCertificatePath) fs.unlinkSync(newCertificatePath);
      if (newPhotoPath) fs.unlinkSync(newPhotoPath);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: 'Concession form not found.'
      });
    }

    const updatedData = {
      ...req.body,
      schoolId,
      castOrIncomeCertificate: newCertificateFile
        ? getConcessionFilePath(newCertificateFile)
        : existingForm.castOrIncomeCertificate,
      studentPhoto: newPhotoFile
        ? getConcessionFilePath(newPhotoFile)
        : existingForm.studentPhoto
    };

    const { error } = ConcessionFormValidator.validate(updatedData);
    if (error) {
      if (newCertificatePath) fs.unlinkSync(newCertificatePath);
      if (newPhotoPath) fs.unlinkSync(newPhotoPath);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: error.details[0].message
      });
    }

    if (newCertificateFile && existingForm.castOrIncomeCertificate) {
      const oldCertPath = `.${existingForm.castOrIncomeCertificate}`;
      if (fs.existsSync(oldCertPath)) fs.unlinkSync(oldCertPath);
    }

    if (newPhotoFile && existingForm.studentPhoto) {
      const oldPhotoPath = `.${existingForm.studentPhoto}`;
      if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
    }

    const updatedForm = await ConcessionFormModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      session
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: 'Concession form updated successfully.',
      form: updatedForm
    });
  } catch (err) {
    if (newCertificatePath) fs.unlinkSync(newCertificatePath);
    if (newPhotoPath) fs.unlinkSync(newPhotoPath);
    await session.abortTransaction();
    session.endSession();

    if (err.code === 11000 && (err.message.includes('AdmissionNumber') || err.message.includes('receiptNumber'))) {
      return res.status(409).json({
        hasError: true,
        message: `Duplicate ${err.message.includes('AdmissionNumber') ? 'Admission number' : 'receipt number'} for this school.`
      });
    }

    return res.status(500).json({
      hasError: true,
      message: err.message,
      details: 'Transaction aborted. No changes were saved.'
    });
  }
};

export default updateConcessionForm;