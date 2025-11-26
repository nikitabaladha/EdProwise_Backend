// import mongoose from 'mongoose';
// import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
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
//       message: 'Access denied: School ID missing.'
//     });
//   }

//   const { error } = AdmissionValidator.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       hasError: true,
//       message: error.details[0].message
//     });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { registrationNumber } = req.body;

//     const existingAdmission = await AdmissionFormModel.findOne({ schoolId, registrationNumber }).session(session);
//     if (existingAdmission) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(409).json({
//         hasError: true,
//         message: `Student with registration number ${registrationNumber} already exists in this school.`,
//         admission: existingAdmission
//       });
//     }

//     const files = req.files || {};
//     const registeredStudent = await StudentRegistration.findOne({ schoolId, registrationNumber }).session(session);

//     const newAdmission = new AdmissionFormModel({
//       ...req.body,
//       schoolId,
//       studentPhoto: files?.studentPhoto?.[0] ? getFilePath(files.studentPhoto[0]) : registeredStudent?.studentPhoto || '',
//       aadharPassportFile: files?.aadharPassportFile?.[0] ? getFilePath(files.aadharPassportFile[0]) : registeredStudent?.aadharPassportFile || '',
//       castCertificate: files?.castCertificate?.[0] ? getFilePath(files.castCertificate[0]) : registeredStudent?.castCertificate || '',
//       tcCertificate: files?.tcCertificate?.[0] ? getFilePath(files.tcCertificate[0]) : registeredStudent?.tcCertificate || '',
//       previousSchoolResult: files?.previousSchoolResult?.[0] ? getFilePath(files.previousSchoolResult[0]) : registeredStudent?.previousSchoolResult || '',
//       idCardFile: files?.idCardFile?.[0] ? getFilePath(files.idCardFile[0]) : registeredStudent?.idCardFile || '',
//       proofOfResidence: files?.proofOfResidence?.[0] ? getFilePath(files.proofOfResidence[0]) : registeredStudent?.proofOfResidence || ''
//     });

//     newAdmission.$session(session);
//     await newAdmission.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       hasError: false,
//       message: 'Admission form submitted successfully.',
//       admission: newAdmission
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();


//     if (err.code === 11000 && err.message.includes('registrationNumber')) {
//       return res.status(409).json({
//         hasError: true,
//         message: `Duplicate registration number ${req.body.registrationNumber} for this school.`
//       });
//     }

//     res.status(500).json({
//       hasError: true,
//       message: err.message,
//       details: 'Transaction aborted. No changes were saved.'
//     });
//   }
// };

// export default admissionform;


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


//     const existingAdmission = await AdmissionFormModel.findOne({
//       schoolId,
//       registrationNumber,
//     }).session(session);
//     if (existingAdmission) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(409).json({
//         hasError: true,
//         message: `Student with registration number ${registrationNumber} already exists in this school.`,
//         admission: existingAdmission,
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

   
//     const registeredStudent = await StudentRegistration.findOne({
//       schoolId,
//       registrationNumber,
//     }).session(session);

 
//     const files = req.files || {};

  
//     const newAdmission = new AdmissionFormModel({
//       ...restBody,
//       schoolId,
//       registrationNumber,
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

//     newAdmission.$session(session);
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

//     if (err.code === 11000 && err.message.includes('registrationNumber')) {
//       return res.status(409).json({
//         hasError: true,
//         message: `Duplicate registration number ${req.body.registrationNumber} for this school.`,
//       });
//     }

//     res.status(500).json({
//       hasError: true,
//       message: err.message,
//       details: 'Transaction aborted. No changes were saved.',
//     });
//   }
// };

// export default admissionform;

import mongoose from 'mongoose';
import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationFormCopy.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import MasterDefineShift from '../../../../models/FeesModule/MasterDefineShift.js';
import { AdmissionValidator } from '../../../../validators/FeesModule/AdmissionValidator/Admissionvalidator.js';

const getFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/AdmissionForm/${file.filename}`
    : `/Documents/AdmissionForm/${file.filename}`;
};

const admissionform = async (req, res) => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  const { error } = AdmissionValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      registrationNumber,
      academicYear,
      masterDefineClass,
      section,
      masterDefineShift,
      ...restBody
    } = req.body;

    // Normalize registrationNumber: convert empty string or 'null' string to null
    const normalizedRegistrationNumber =
      registrationNumber && registrationNumber.trim() !== '' && registrationNumber.toLowerCase() !== 'null'
        ? registrationNumber.trim()
        : null;

    // Check for duplicate registrationNumber only if it's non-null
    if (normalizedRegistrationNumber) {
      const existingAdmission = await AdmissionFormModel.findOne({
        schoolId,
        registrationNumber: normalizedRegistrationNumber,
      }).session(session);
      if (existingAdmission) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          hasError: true,
          message: `Student with registration number ${normalizedRegistrationNumber} already exists in this school.`,
          admission: existingAdmission,
        });
      }
    }
    // No duplicate check for null registrationNumber, as sparse index allows multiple nulls

    // Validate class
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

    // Validate section and shift
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

    // Validate shift
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

    // Fetch registered student, if registrationNumber is provided
    const registeredStudent = normalizedRegistrationNumber
      ? await StudentRegistration.findOne({
          schoolId,
          registrationNumber: normalizedRegistrationNumber,
        }).session(session)
      : null;

    const files = req.files || {};

    const newAdmission = new AdmissionFormModel({
      ...restBody,
      schoolId,
      registrationNumber: normalizedRegistrationNumber,
      academicYear,
      academicHistory: [
        {
          academicYear,
          masterDefineClass,
          section,
          masterDefineShift,
        },
      ],
      studentPhoto: files?.studentPhoto?.[0]
        ? getFilePath(files.studentPhoto[0])
        : registeredStudent?.studentPhoto || '',
      aadharPassportFile: files?.aadharPassportFile?.[0]
        ? getFilePath(files.aadharPassportFile[0])
        : registeredStudent?.aadharPassportFile || '',
      castCertificate: files?.castCertificate?.[0]
        ? getFilePath(files.castCertificate[0])
        : registeredStudent?.castCertificate || '',
      tcCertificate: files?.tcCertificate?.[0]
        ? getFilePath(files.tcCertificate[0])
        : registeredStudent?.tcCertificate || '',
      previousSchoolResult: files?.previousSchoolResult?.[0]
        ? getFilePath(files.previousSchoolResult[0])
        : registeredStudent?.previousSchoolResult || '',
      idCardFile: files?.idCardFile?.[0]
        ? getFilePath(files.idCardFile[0])
        : registeredStudent?.idCardFile || '',
      proofOfResidence: files?.proofOfResidence?.[0]
        ? getFilePath(files.proofOfResidence[0])
        : registeredStudent?.proofOfResidence || '',
    });

    newAdmission.$session(session);
    await newAdmission.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      hasError: false,
      message: 'Admission form submitted successfully.',
      admission: newAdmission,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // if (err.code === 11000 && err.message.includes('registrationNumber')) {
    //   return res.status(409).json({
    //     hasError: true,
    //     message: `Duplicate registration number ${req.body.registrationNumber} for this school.`,
    //   });
    // }

    res.status(500).json({
      hasError: true,
      message: err.message,
      details: 'Transaction aborted. No changes were saved.',
    });
  }
};

export default admissionform;
