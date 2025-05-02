import fs from 'fs';
import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';
import { ConcessionFormValidator } from '../../../../validators/FeesModule/ConcessionValidator/ConcessionFormvalidator.js';

const getConcessionFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/Concession/${file.filename}`
    : `/Documents/Concession/${file.filename}`;
};

const createConcessionForm = async (req, res) => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.'
    });
  }

  const castOrIncomeCertificateFile = req.files?.castOrIncomeCertificate?.[0];
  const castOrIncomeCertificatePath = castOrIncomeCertificateFile?.path;

  const { AdmissionNumber } = req.body;
  const { error } = ConcessionFormValidator.validate({ ...req.body, schoolId });

  if (error) {
    if (castOrIncomeCertificatePath) {
      fs.unlinkSync(castOrIncomeCertificatePath);
    }
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message
    });
  }

  try {
    const existingForm = await ConcessionFormModel.findOne({ AdmissionNumber, schoolId });

    if (existingForm) {
      if (castOrIncomeCertificatePath) {
        fs.unlinkSync(castOrIncomeCertificatePath);
      }
      return res.status(400).json({
        hasError: true,
        message: `Concession form for admission number ${AdmissionNumber} already exists.`
      });
    }

    const form = new ConcessionFormModel({
      ...req.body,
      schoolId,
      castOrIncomeCertificate: getConcessionFilePath(castOrIncomeCertificateFile) 
    });

    await form.save();

    return res.status(201).json({
      hasError: false,
      message: 'Concession form submitted successfully.',
      form
    });

  } catch (err) {
    if (castOrIncomeCertificatePath) {
      fs.unlinkSync(castOrIncomeCertificatePath);
    }
    return res.status(500).json({
      hasError: true,
      message: err.message
    });
  }
};

export default createConcessionForm;
