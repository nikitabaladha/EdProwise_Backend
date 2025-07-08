import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import { RegistrationCreateValidator } from '../../../../validators/RegistrationValidator/RegistrationValidator.js';
import mongoose from 'mongoose';

const getFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/Registration/${file.filename}`
    : `/Documents/Registration/${file.filename}`;
};

const registrationform = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.'
    });
  }

  const { error } = RegistrationCreateValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ hasError: true, message: error.details[0].message });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const files = req.files;

    const newStudent = new StudentRegistration({
      ...req.body,
      schoolId,
     aadharPassportFile: getFilePath(files?.aadharPassportFile?.[0]),
  castCertificate: getFilePath(files?.castCertificate?.[0]),
  tcCertificate: getFilePath(files?.tcCertificate?.[0]),
  previousSchoolResult: getFilePath(files?.previousSchoolResult?.[0]),
  studentPhoto: getFilePath(files?.studentPhoto?.[0]),
  idCardFile: getFilePath(files?.idCardFile?.[0]), 
  proofOfResidence: getFilePath(files?.proofOfResidence?.[0])

    });

    newStudent.$session(session);

    await newStudent.save({ session });


    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      hasError: false,
      message: 'Student registered successfully.',
      student: newStudent
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

export default registrationform;

// import mongoose from 'mongoose';
// import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
// import MasterDefineShift from '../../../../models/FeesModule/MasterDefineShift.js';
// import { AdmissionValidator } from '../../../../validators/FeesModule/AdmissionValidator/Admissionvalidator.js';

// const getFilePath = (file) => {
//   if (!file) return '';
//   return file.mimetype.startsWith('image/')
//     ? `/Images/AdmissionForm/${file.filename}`
//     : `/Documents/AdmissionForm/${file.filename}`;
// };

// const admissionform = async (req, res) => {
//   const schoolId = req.user?.schoolId;

//   if (!schoolId) {
//     return res.status(401).json({
//       hasError: true,
//       message: 'Access denied: School ID missing.',
//     });
//   }

//   const { error } = AdmissionValidator.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       hasError: true,
//       message: error.details[0].message,
//     });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       registrationNumber,
//       academicYear,
//       masterDefineClass,
//       section,
//       masterDefineShift,
//       ...restBody
//     } = req.body;

//     // Normalize registrationNumber: convert empty string to null
//     const normalizedRegistrationNumber = registrationNumber && registrationNumber.trim() !== '' ? registrationNumber.trim() : null;

//     // Define the query object
//     const query = { schoolId };
//     if (normalizedRegistrationNumber) {
//       query.registrationNumber = normalizedRegistrationNumber;
//     }

//     // Check for existing admission
//     const existingAdmission = await AdmissionFormModel.findOne(query).session(session);
//     if (existingAdmission) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(409).json({
//         hasError: true,
//         message: `Student with registration number ${normalizedRegistrationNumber || 'empty'} already exists in this school.`,
//         admission: existingAdmission,
//       });
//     }

//     // Validate class
//     if (!mongoose.Types.ObjectId.isValid(masterDefineClass)) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         hasError: true,
//         message: 'Invalid class ID format.',
//       });
//     }

//     const classExists = await ClassAndSection.findOne({
//       _id: masterDefineClass,
//       schoolId,
//       academicYear,
//     }).session(session);
//     if (!classExists) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         hasError: true,
//         message: 'Invalid class ID provided.',
//       });
//     }

//     // Validate section and shift
//     if (!mongoose.Types.ObjectId.isValid(section) || !mongoose.Types.ObjectId.isValid(masterDefineShift)) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         hasError: true,
//         message: 'Invalid section or shift ID format.',
//       });
//     }

//     const sectionExists = classExists.sections.find(
//       (sec) => sec._id.toString() === section && sec.shiftId.toString() === masterDefineShift
//     );
//     if (!sectionExists) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         hasError: true,
//         message: 'Invalid section or shift ID provided.',
//       });
//     }

//     // Validate shift
//     const shiftExists = await MasterDefineShift.findOne({
//       _id: masterDefineShift,
//       schoolId,
//       academicYear,
//     }).session(session);
//     if (!shiftExists) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         hasError: true,
//         message: 'Invalid shift ID provided.',
//       });
//     }

//     // Fetch registered student data (if any)
//     const registeredStudent = normalizedRegistrationNumber
//       ? await StudentRegistration.findOne({
//           schoolId,
//           registrationNumber: normalizedRegistrationNumber,
//         }).session(session)
//       : null;

//     const files = req.files || {};

//     const newAdmission = new AdmissionFormModel({
//       ...restBody,
//       schoolId,
//       registrationNumber: normalizedRegistrationNumber,
//       academicYear,
//       academicHistory: [
//         {
//           academicYear,
//           masterDefineClass,
//           section,
//           masterDefineShift,
//         },
//       ],
//       studentPhoto: files?.studentPhoto?.[0]
//         ? getFilePath(files.studentPhoto[0])
//         : registeredStudent?.studentPhoto || '',
//       aadharPassportFile: files?.aadharPassportFile?.[0]
//         ? getFilePath(files.aadharPassportFile[0])
//         : registeredStudent?.aadharPassportFile || '',
//       castCertificate: files?.castCertificate?.[0]
//         ? getFilePath(files.castCertificate[0])
//         : registeredStudent?.castCertificate || '',
//       tcCertificate: files?.tcCertificate?.[0]
//         ? getFilePath(files.tcCertificate[0])
//         : registeredStudent?.tcCertificate || '',
//       previousSchoolResult: files?.previousSchoolResult?.[0]
//         ? getFilePath(files.previousSchoolResult[0])
//         : registeredStudent?.previousSchoolResult || '',
//       idCardFile: files?.idCardFile?.[0]
//         ? getFilePath(files.idCardFile[0])
//         : registeredStudent?.idCardFile || '',
//       proofOfResidence: files?.proofOfResidence?.[0]
//         ? getFilePath(files.proofOfResidence[0])
//         : registeredStudent?.proofOfResidence || '',
//     });

//     await newAdmission.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       hasError: false,
//       message: 'Admission form submitted successfully.',
//       admission: newAdmission,
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();

//     if (err.code === 11000) {
//       let errorField = 'unknown';
//       if (err.message.includes('registrationNumber')) {
//         errorField = 'registrationNumber';
//       } else if (err.message.includes('AdmissionNumber')) {
//         errorField = 'AdmissionNumber';
//       } else if (err.message.includes('receiptNumber')) {
//         errorField = 'receiptNumber';
//       } else if (err.message.includes('transactionNumber')) {
//         errorField = 'transactionNumber';
//       }
//       return res.status(409).json({
//         hasError: true,
//         message: `Duplicate ${errorField} detected.`,
//       });
//     }

//     res.status(500).json({
//       hasError: true,
//       message: `Error submitting admission form: ${err.message}`,
//       details: 'Transaction aborted. No changes were saved.',
//     });
//   }
// };

// export default admissionform;
