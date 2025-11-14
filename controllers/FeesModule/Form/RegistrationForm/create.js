
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
//     const {
//       registrationFee,
//       concessionType,
//       concessionAmount,
//       finalAmount,
//       paymentMode,
//       chequeNumber,
//       bankName,
//       name,
//       ...studentFields
//     } = req.body;

//     const studentData = {
//       ...studentFields,
//       schoolId,
//       aadharPassportFile: getFilePath(files.aadharPassportFile?.[0]),
//       castCertificate: getFilePath(files.castCertificate?.[0]),
//       tcCertificate: getFilePath(files.tcCertificate?.[0]),
//       previousSchoolResult: getFilePath(files.previousSchoolResult?.[0]),
//       studentPhoto: getFilePath(files.studentPhoto?.[0]),
//       idCardFile: getFilePath(files.idCardFile?.[0]),
//       proofOfResidence: getFilePath(files.proofOfResidence?.[0]),
//     };

//     const newStudent = new StudentRegistration(studentData);
//     await newStudent.save();

//     let newPayment = null;
//     if (hasPaymentData(req.body)) {
//       const paymentData = {
//         studentId: newStudent._id,
//         academicYear: newStudent.academicYear,
//         schoolId,
//         registrationFee: registrationFee || 0,
//         concessionType: concessionType || null,
//         concessionAmount: concessionAmount || 0,
//         finalAmount: finalAmount || 0,
//         paymentMode: paymentMode || 'null',
//         chequeNumber: chequeNumber || '',
//         bankName: bankName || '',
//         name: name || '',
//       };

//       newPayment = new RegistrationPayment(paymentData);
//       await newPayment.save();
//     }

//     res.status(201).json({
//       hasError: false,
//       message: 'Student registered successfully.',
//       student: newStudent,
//       payment: newPayment || null,
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
//     });
//   }
// };

// export default registrationform;



import mongoose from 'mongoose';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import TempStudent from '../../../../models/StudentSignupTemp.js';
import { RegistrationCreateValidator } from '../../../../validators/RegistrationValidator/RegistrationValidator.js';

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
    const { email, ...studentFields } = req.body;


    const studentData = {
      ...studentFields,
      email,
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


    if (email) {
      const updatedTemp = await TempStudent.findOneAndUpdate(
        {
          schoolId,
          email: email.trim().toLowerCase(),
        },
        { $set: { registrationFormId: newStudent._id } },
        { new: true, runValidators: true }
      );

      console.log(
        updatedTemp
          ? `TempStudent ${updatedTemp._id} (school ${schoolId}) linked to registration ${newStudent._id}`
          : `No TempStudent found for schoolId=${schoolId} & email=${email}`
      );
    }


    res.status(201).json({
      hasError: false,
      message: 'Student registered successfully.',
      student: newStudent,
      payment: null,
    });
  } catch (err) {
    console.error('Registration error:', err);
    const message =
      err.code === 11000
        ? 'Registration number or other unique field already exists.'
        : err.message || 'An error occurred during registration.';

    res.status(500).json({ hasError: true, message });
  }
};

export default registrationform;