import mongoose from 'mongoose';
import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import MasterDefineShift from '../../../../models/FeesModule/MasterDefineShift.js';
import {UpdateAdmissionValidator } from '../../../../validators/FeesModule/AdmissionValidator/UpdateAdmissionValidator.js';

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
      message: 'Access denied: School ID missing.',
    });
  }

  const { error } = UpdateAdmissionValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message,
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
        message: 'Admission form not found.',
      });
    }

    const { masterDefineClass, section, masterDefineShift, academicYear, ...restBody } = req.body;


    if (masterDefineClass || section || masterDefineShift) {
      if (!masterDefineClass || !section || !masterDefineShift || !academicYear) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          hasError: true,
          message: 'Class, section, shift, and academic year must all be provided for updating academic history.',
        });
      }


      const classExists = await ClassAndSection.findOne({
        _id: masterDefineClass,
        schoolId,
        academicYear,
      }).session(session);
      if (!classExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          hasError: true,
          message: 'Invalid class ID provided.',
        });
      }


      const sectionExists = classExists.sections.find(
        (sec) => sec._id.toString() === section && sec.shiftId.toString() === masterDefineShift
      );
      if (!sectionExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          hasError: true,
          message: 'Invalid section or shift ID provided.',
        });
      }

  
      const shiftExists = await MasterDefineShift.findOne({
        _id: masterDefineShift,
        schoolId,
        academicYear,
      }).session(session);
      if (!shiftExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          hasError: true,
          message: 'Invalid shift ID provided.',
        });
      }

    
      const academicHistoryEntry = existingAdmission.academicHistory.find(
        (entry) => entry.academicYear === academicYear
      );

      if (academicHistoryEntry) {
  
        academicHistoryEntry.masterDefineClass = masterDefineClass;
        academicHistoryEntry.section = section;
        academicHistoryEntry.masterDefineShift = masterDefineShift;
      } else {
    
        existingAdmission.academicHistory.push({
          academicYear,
          masterDefineClass,
          section,
          masterDefineShift,
        });
      }
    }

 
    const files = req.files || {};

    const updatedFields = {
      ...restBody,
      studentPhoto: getFilePath(files?.studentPhoto?.[0]) || existingAdmission.studentPhoto,
      aadharPassportFile: getFilePath(files?.aadharPassportFile?.[0]) || existingAdmission.aadharPassportFile,
      castCertificate: getFilePath(files?.castCertificate?.[0]) || existingAdmission.castCertificate,
      tcCertificate: getFilePath(files?.tcCertificate?.[0]) || existingAdmission.tcCertificate,
      previousSchoolResult: getFilePath(files?.previousSchoolResult?.[0]) || existingAdmission.previousSchoolResult,
      idCardFile: getFilePath(files?.idCardFile?.[0]) || existingAdmission.idCardFile,
      proofOfResidence: getFilePath(files?.proofOfResidence?.[0]) || existingAdmission.proofOfResidence,
    };

   
    const updatedAdmission = await AdmissionFormModel.findByIdAndUpdate(
      id,
      { $set: updatedFields, academicHistory: existingAdmission.academicHistory },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      hasError: false,
      message: 'Admission form updated successfully.',
      admission: updatedAdmission,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      hasError: true,
      message: err.message,
      details: 'Transaction aborted. No changes were saved.',
    });
  }
};

export default updateAdmissionForm;