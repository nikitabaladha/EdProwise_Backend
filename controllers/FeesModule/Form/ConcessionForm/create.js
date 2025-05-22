import mongoose from 'mongoose';
import fs from 'fs';
import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';
import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
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

  const { AdmissionNumber, academicYear } = req.body;

  const castOrIncomeCertificateFile = req.files?.castOrIncomeCertificate?.[0];
  const studentPhotoFile = req.files?.studentPhoto?.[0];
  const castOrIncomeCertificatePath = castOrIncomeCertificateFile?.path;
  const studentPhotoPath = studentPhotoFile?.path;

  const { error } = ConcessionFormValidator.validate({ ...req.body, schoolId });
  if (error) {
    if (castOrIncomeCertificatePath) fs.unlinkSync(castOrIncomeCertificatePath);
    if (studentPhotoPath) fs.unlinkSync(studentPhotoPath);
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingForm = await ConcessionFormModel.findOne({
      AdmissionNumber,
      schoolId,
      academicYear
    }).session(session);

    if (existingForm) {
      if (castOrIncomeCertificatePath) fs.unlinkSync(castOrIncomeCertificatePath);
      if (studentPhotoPath) fs.unlinkSync(studentPhotoPath);
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        hasError: true,
        message: `Concession form for admission number ${AdmissionNumber} already exists for academic year ${academicYear}.`
      });
    }

    const admissionData = await AdmissionFormModel.findOne({ AdmissionNumber, schoolId }).session(session);
    if (!admissionData) {
      if (castOrIncomeCertificatePath) fs.unlinkSync(castOrIncomeCertificatePath);
      if (studentPhotoPath) fs.unlinkSync(studentPhotoPath);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: `No student found with admission number ${AdmissionNumber} in this school.`
      });
    }

    const studentPhoto = studentPhotoFile
      ? getConcessionFilePath(studentPhotoFile)
      : admissionData?.studentPhoto || '';

    const form = new ConcessionFormModel({
      ...req.body,
      schoolId,
      studentPhoto,
      castOrIncomeCertificate: getConcessionFilePath(castOrIncomeCertificateFile)
    });

    form.$session(session);
    await form.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: 'Concession form submitted successfully.',
      form
    });
  } catch (err) {
    if (castOrIncomeCertificatePath) fs.unlinkSync(castOrIncomeCertificatePath);
    if (studentPhotoPath) fs.unlinkSync(studentPhotoPath);
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

export default createConcessionForm;