// // import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// // import { RegistrationCreateValidator } from '../../../../validators/RegistrationValidator/RegistrationValidator.js';
// // import mongoose from 'mongoose';

// // const getFilePath = (file) => {
// //   if (!file) return '';
// //   return file.mimetype.startsWith('image/')
// //     ? `/Images/Registration/${file.filename}`
// //     : `/Documents/Registration/${file.filename}`;
// // };

// // const registrationform = async (req, res) => {
// //   const schoolId = req.user?.schoolId;
// //   if (!schoolId) {
// //     return res.status(401).json({
// //       hasError: true,
// //       message: 'Access denied: School ID missing.'
// //     });
// //   }

// //   const { error } = RegistrationCreateValidator.validate(req.body);
// //   if (error) {
// //     return res.status(400).json({ hasError: true, message: error.details[0].message });
// //   }

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const files = req.files;

// //     const newStudent = new StudentRegistration({
// //       ...req.body,
// //       schoolId,
// //      aadharPassportFile: getFilePath(files?.aadharPassportFile?.[0]),
// //   castCertificate: getFilePath(files?.castCertificate?.[0]),
// //   tcCertificate: getFilePath(files?.tcCertificate?.[0]),
// //   previousSchoolResult: getFilePath(files?.previousSchoolResult?.[0]),
// //   studentPhoto: getFilePath(files?.studentPhoto?.[0]),
// //   idCardFile: getFilePath(files?.idCardFile?.[0]), 
// //   proofOfResidence: getFilePath(files?.proofOfResidence?.[0])

// //     });

// //     newStudent.$session(session);

// //     await newStudent.save({ session });


// //     await session.commitTransaction();
// //     session.endSession();

// //     res.status(201).json({
// //       hasError: false,
// //       message: 'Student registered successfully.',
// //       student: newStudent
// //     });
// //   } catch (err) {

// //     await session.abortTransaction();
// //     session.endSession();

  

// //     res.status(500).json({
// //       hasError: true,
// //       message: err.message,
// //       details: 'Transaction aborted. No changes were saved.'
// //     });
// //   }
// // };

// // export default registrationform;


// // import mongoose from 'mongoose';
// // import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// // import { RegistrationCreateValidator } from '../../../../validators/RegistrationValidator/RegistrationValidator.js';

// // const getFilePath = (file) => {
// //   if (!file) return '';
// //   return file.mimetype.startsWith('image/')
// //     ? `/Images/Registration/${file.filename}`
// //     : `/Documents/Registration/${file.filename}`;
// // };

// // const registrationform = async (req, res) => {
// //   const schoolId = req.user?.schoolId;
// //   if (!schoolId) {
// //     return res.status(401).json({
// //       hasError: true,
// //       message: 'Access denied: School ID missing.',
// //     });
// //   }

// //   const { error } = RegistrationCreateValidator.validate(req.body);
// //   if (error) {
// //     return res.status(400).json({
// //       hasError: true,
// //       message: error.details[0].message,
// //     });
// //   }

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const files = req.files;

// //     const studentData = {
// //       ...req.body,
// //       schoolId,
// //       aadharPassportFile: getFilePath(files?.aadharPassportFile?.[0]),
// //       castCertificate: getFilePath(files?.castCertificate?.[0]),
// //       tcCertificate: getFilePath(files?.tcCertificate?.[0]),
// //       previousSchoolResult: getFilePath(files?.previousSchoolResult?.[0]),
// //       studentPhoto: getFilePath(files?.studentPhoto?.[0]),
// //       idCardFile: getFilePath(files?.idCardFile?.[0]),
// //       proofOfResidence: getFilePath(files?.proofOfResidence?.[0]),
// //     };

// //     const newStudent = new StudentRegistration(studentData);
// //     newStudent.$session(session);
// //     await newStudent.save({ session });

// //     await session.commitTransaction();
// //     session.endSession();

// //     res.status(201).json({
// //       hasError: false,
// //       message: 'Student registered successfully.',
// //       student: newStudent,
// //     });
// //   } catch (err) {
// //     await session.abortTransaction();
// //     session.endSession();

// //     console.error('Registration error:', err);
// //     res.status(500).json({
// //       hasError: true,
// //       message: err.message || 'An error occurred during registration.',
// //       details: 'Transaction aborted. No changes were saved.',
// //     });
// //   }
// // };

// // export default registrationform;
// import mongoose from 'mongoose';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';
// import { RegistrationCreateValidator } from '../../../../validators/RegistrationValidator/RegistrationValidator.js';

// const getFilePath = (file) => {
//   if (!file) return '';
//   return file.mimetype.startsWith('image/')
//     ? `/Images/Registration/${file.filename}`
//     : `/Documents/Registration/${file.filename}`;
// };


// const withTransaction = async (callback) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const result = await callback(session);
//     await session.commitTransaction();
//     return result;
//   } catch (err) {
//     await session.abortTransaction();
//     throw err;
//   } finally {
//     session.endSession();
//   }
// };


// const hasPaymentData = (body) => {
//   const paymentFields = [
//     'registrationFee',
//     'concessionType',
//     'concessionAmount',
//     'finalAmount',
//     'paymentMode',
//     'chequeNumber',
//     'bankName',
//     'name',
//   ];
//   return paymentFields.some((field) => body[field] && body[field] !== '');
// };

// const registrationform = async (req, res) => {
//   const schoolId = req.user?.schoolId;
//   if (!schoolId) {
//     return res.status(401).json({
//       hasError: true,
//       message: 'Access denied: School ID missing.',
//     });
//   }


//   const { error } = RegistrationCreateValidator.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       hasError: true,
//       message: error.details[0].message,
//     });
//   }


//   const files = req.files || {};
//   if (!files || typeof files !== 'object') {
//     return res.status(400).json({
//       hasError: true,
//       message: 'Invalid or missing file uploads.',
//     });
//   }

//   try {
//     const result = await withTransaction(async (session) => {

//       const {
//         registrationFee,
//         concessionType,
//         concessionAmount,
//         finalAmount,
//         paymentMode,
//         chequeNumber,
//         bankName,
//         name,
//         ...studentFields
//       } = req.body;

//       const studentData = {
//         ...studentFields,
//         schoolId,
//         aadharPassportFile: getFilePath(files.aadharPassportFile?.[0]),
//         castCertificate: getFilePath(files.castCertificate?.[0]),
//         tcCertificate: getFilePath(files.tcCertificate?.[0]),
//         previousSchoolResult: getFilePath(files.previousSchoolResult?.[0]),
//         studentPhoto: getFilePath(files.studentPhoto?.[0]),
//         idCardFile: getFilePath(files.idCardFile?.[0]),
//         proofOfResidence: getFilePath(files.proofOfResidence?.[0]),
//       };

    
//       const newStudent = new StudentRegistration(studentData);
//       newStudent.$session(session);
//       await newStudent.save({ session });

  
//       let newPayment = null;
//       if (hasPaymentData(req.body)) {
//         const paymentData = {
//           studentId: newStudent._id,
//           schoolId,
//           // registrationNumber: newStudent.registrationNumber,
//           registrationFee: registrationFee || 0,
//           concessionType: concessionType || null,
//           concessionAmount: concessionAmount || 0,
//           finalAmount: finalAmount || 0,
//           paymentMode: paymentMode || 'null',
//           chequeNumber: chequeNumber || '',
//           bankName: bankName || '',
//           name: name || '',
//         };

//         newPayment = new RegistrationPayment(paymentData);
//         newPayment.$session(session);
//         await newPayment.save({ session });
//       }

//       return { student: newStudent, payment: newPayment };
//     });

//     res.status(201).json({
//       hasError: false,
//       message: 'Student registered successfully.',
//       student: result.student,
//       payment: result.payment || null, 
//     });
//   } catch (err) {
//     console.error('Registration error:', err);
//     const message =
//       err.code === 11000
//         ? 'Registration number or other unique field already exists.'
//         : err.message || 'An error occurred during registration.';
//     res.status(500).json({
//       hasError: true,
//       message,
//       details: 'Transaction aborted. No changes were saved.',
//     });
//   }
// };

// export default registrationform;

import mongoose from 'mongoose';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';
import { RegistrationCreateValidator } from '../../../../validators/RegistrationValidator/RegistrationValidator.js';

const getFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/Registration/${file.filename}`
    : `/Documents/Registration/${file.filename}`;
};

const hasPaymentData = (body) => {
  const paymentFields = [
    'registrationFee',
    'concessionType',
    'concessionAmount',
    'finalAmount',
    'paymentMode',
    'chequeNumber',
    'bankName',
    'name',
  ];
  return paymentFields.some((field) => body[field] && body[field] !== '');
};

const registrationform = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  const { error } = RegistrationCreateValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message,
    });
  }

  const files = req.files || {};
  if (!files || typeof files !== 'object') {
    return res.status(400).json({
      hasError: true,
      message: 'Invalid or missing file uploads.',
    });
  }

  try {
    const {
      registrationFee,
      concessionType,
      concessionAmount,
      finalAmount,
      paymentMode,
      chequeNumber,
      bankName,
      name,
      ...studentFields
    } = req.body;

    const studentData = {
      ...studentFields,
      schoolId,
      aadharPassportFile: getFilePath(files.aadharPassportFile?.[0]),
      castCertificate: getFilePath(files.castCertificate?.[0]),
      tcCertificate: getFilePath(files.tcCertificate?.[0]),
      previousSchoolResult: getFilePath(files.previousSchoolResult?.[0]),
      studentPhoto: getFilePath(files.studentPhoto?.[0]),
      idCardFile: getFilePath(files.idCardFile?.[0]),
      proofOfResidence: getFilePath(files.proofOfResidence?.[0]),
    };

    const newStudent = new StudentRegistration(studentData);
    await newStudent.save();

    let newPayment = null;
    if (hasPaymentData(req.body)) {
      const paymentData = {
        studentId: newStudent._id,
        academicYear: newStudent.academicYear,
        schoolId,
        registrationFee: registrationFee || 0,
        concessionType: concessionType || null,
        concessionAmount: concessionAmount || 0,
        finalAmount: finalAmount || 0,
        paymentMode: paymentMode || 'null',
        chequeNumber: chequeNumber || '',
        bankName: bankName || '',
        name: name || '',
      };

      newPayment = new RegistrationPayment(paymentData);
      await newPayment.save();
    }

    res.status(201).json({
      hasError: false,
      message: 'Student registered successfully.',
      student: newStudent,
      payment: newPayment || null,
    });
  } catch (err) {
    console.error('Registration error:', err);
    const message =
      err.code === 11000
        ? 'Registration number or other unique field already exists.'
        : err.message || 'An error occurred during registration.';
    res.status(500).json({
      hasError: true,
      message,
    });
  }
};

export default registrationform;