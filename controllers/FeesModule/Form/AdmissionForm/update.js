import mongoose from 'mongoose';
import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
import { AdmissionValidator } from '../../../../validators/FeesModule/AdmissionValidator/UpdateAdmissionValidator.js';

const getFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/AdmissionForm/${file.filename}`
    : `/Documents/AdmissionForm/${file.filename}`;
};

const updateAdmissionForm = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.'
    });
  }

  const { error } = AdmissionValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message
    });
  }

  const id = req.params.id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingAdmission = await AdmissionFormModel.findOne({ _id: id, schoolId }).session(session);

    if (!existingAdmission) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: 'Admission form not found.'
      });
    }

    const files = req.files || {};

    const updatedFields = {
      ...req.body,
      studentPhoto: getFilePath(files?.studentPhoto?.[0]) || existingAdmission.studentPhoto,
      aadharPassportFile: getFilePath(files?.aadharPassportFile?.[0]) || existingAdmission.aadharPassportFile,
      castCertificate: getFilePath(files?.castCertificate?.[0]) || existingAdmission.castCertificate,
      tcCertificate: getFilePath(files?.tcCertificate?.[0]) || existingAdmission.tcCertificate,
      previousSchoolResult: getFilePath(files?.previousSchoolResult?.[0]) || existingAdmission.previousSchoolResult,
      idCardFile: getFilePath(files?.idCardFile?.[0]) || existingAdmission.idCardFile,
      proofOfResidence: getFilePath(files?.proofOfResidence?.[0]) || existingAdmission.proofOfResidence
    };

    const updatedAdmission = await AdmissionFormModel.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      hasError: false,
      message: 'Admission form updated successfully.',
      admission: updatedAdmission
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      hasError: true,
      message: err.message,
      details: 'Transaction aborted. No changes were saved.'
    });
  }
};

export default updateAdmissionForm;