import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';
import { ConcessionFormValidator } from '../../../../validators/FeesModule/ConcessionValidator/ConcessionFormvalidator.js';
import fs from 'fs';

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

  try {
    const existingForm = await ConcessionFormModel.findOne({ _id: id, schoolId });

    if (!existingForm) {
      return res.status(404).json({
        hasError: true,
        message: 'Concession form not found.'
      });
    }

    const newCertificateFile = req.files?.castOrIncomeCertificate?.[0];
    const newPhotoFile = req.files?.studentPhoto?.[0];

    const newCertificatePath = newCertificateFile?.path;
    const newPhotoPath = newPhotoFile?.path;

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
      new: true
    });

    return res.status(200).json({
      hasError: false,
      message: 'Concession form updated successfully.',
      form: updatedForm
    });

  } catch (err) {
    if (newCertificatePath && fs.existsSync(newCertificatePath)) fs.unlinkSync(newCertificatePath);
    if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath);
    return res.status(500).json({
      hasError: true,
      message: err.message
    });
  }
};

export default updateConcessionForm;
