// import mongoose from 'mongoose';
// import TCFormModel from '../../../../models/FeesModule/TCForm.js';
// import { TCFormValidator } from '../../../../validators/FeesModule/TcValidator/TCForm.js';
// import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

// const getFilePath = (file) => {
//   if (!file) return '';
//   return file.mimetype.startsWith('image/')
//     ? `/Images/TCForm/${file.filename}`
//     : '';
// };

// const createTCForm = async (req, res) => {
//   const schoolId = req.user?.schoolId;
//   if (!schoolId) {
//     return res.status(401).json({
//       hasError: true,
//       message: 'Access denied: School ID missing.'
//     });
//   }

//   const { AdmissionNumber } = req.body;

//   const { error } = TCFormValidator.validate({ ...req.body, schoolId });
//   if (error) {
//     return res.status(400).json({
//       hasError: true,
//       message: error.details[0].message
//     });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const studentExists = await AdmissionFormModel.findOne({ schoolId, AdmissionNumber }).session(session);
//     if (!studentExists) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         hasError: true,
//         message: `No student found with admission number ${AdmissionNumber} in this school.`
//       });
//     }

//     const existingForm = await TCFormModel.findOne({ schoolId, AdmissionNumber }).session(session);
//     if (existingForm) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(409).json({
//         hasError: true,
//         message: `TC Form for admission number ${AdmissionNumber} already exists.`
//       });
//     }

//     const admissionPhoto = studentExists?.studentPhoto || '';

//     const form = new TCFormModel({
//       ...req.body,
//       schoolId,
//       studentPhoto: req.files?.studentPhoto?.[0]
//         ? getFilePath(req.files.studentPhoto[0])
//         : admissionPhoto
//     });

//     form.$session(session);
//     await form.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       hasError: false,
//       message: 'TC Form submitted successfully.',
//       form
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();

//     if (err.code === 11000 && (err.message.includes('admissionNumber') || err.message.includes('receiptNumber') || err.message.includes('certificateNumber'))) {
//       return res.status(409).json({
//         hasError: true,
//         message: `Duplicate ${err.message.includes('admissionNumber') ? 'admission number' : err.message.includes('receiptNumber') ? 'receipt number' : 'certificate number'} for this school.`
//       });
//     }

//     res.status(500).json({
//       hasError: true,
//       message: err.message,
//       details: 'Transaction aborted. No changes were saved.'
//     });
//   }
// };

// export default createTCForm;

import mongoose from 'mongoose';
import TCFormModel from '../../../../models/FeesModule/TCForm.js';
import { TCPayment } from '../../../../models/FeesModule/TCForm.js';
import { TCFormValidator } from '../../../../validators/FeesModule/TcValidator/TCForm.js';
import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

const getFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/TCForm/${file.filename}`
    : '';
};

const hasPaymentData = (body) => {
  const paymentFields = [
    'TCfees',
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

const createTCForm = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.'
    });
  }

  const { error } = TCFormValidator.validate({ ...req.body, schoolId });
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message
    });
  }

  const files = req.files || {};
  if (!files || typeof files !== 'object') {
    return res.status(400).json({
      hasError: true,
      message: 'Invalid or missing file uploads.'
    });
  }

  try {
    const {
      AdmissionNumber,
      TCfees,
      concessionType,
      concessionAmount,
      finalAmount,
      paymentMode,
      chequeNumber,
      bankName,
      name,
      ...tcFormFields
    } = req.body;

    const studentExists = await AdmissionFormModel.findOne({ schoolId, AdmissionNumber });
    if (!studentExists) {
      return res.status(404).json({
        hasError: true,
        message: `No student found with admission number ${AdmissionNumber} in this school.`
      });
    }

    const existingForm = await TCFormModel.findOne({ schoolId, AdmissionNumber });
    if (existingForm) {
      return res.status(409).json({
        hasError: true,
        message: `TC Form for admission number ${AdmissionNumber} already exists.`
      });
    }

    const admissionPhoto = studentExists?.studentPhoto || '';
    const tcFormData = {
      ...tcFormFields,
      schoolId,
      AdmissionNumber,
      studentPhoto: getFilePath(files.studentPhoto?.[0]) || admissionPhoto,
    };

    const newTCForm = new TCFormModel(tcFormData);
    await newTCForm.save();

    let newPayment = null;
    if (hasPaymentData(req.body)) {
      const paymentData = {
        tcFormId: newTCForm._id,
        schoolId,
        academicYear:newTCForm.academicYear,
        TCfees: TCfees || 0,
        concessionType: concessionType || null,
        concessionAmount: concessionAmount || 0,
        finalAmount: finalAmount || 0,
        paymentMode: paymentMode || 'null',
        chequeNumber: chequeNumber || '',
        bankName: bankName || '',
        name: name || '',
      };

      newPayment = new TCPayment(paymentData);
      await newPayment.save();
    }

    res.status(201).json({
      hasError: false,
      message: 'TC Form created successfully.',
      tcForm: newTCForm,
      payment: newPayment || null,
    });
  } catch (err) {
    if (err.code === 11000 && (err.message.includes('admissionNumber') || err.message.includes('certificateNumber'))) {
      return res.status(409).json({
        hasError: true,
        message: `Duplicate ${err.message.includes('admissionNumber') ? 'admission number' : 'certificate number'} for this school.`
      });
    }

    res.status(500).json({
      hasError: true,
      message: err.message || 'An error occurred during TC form creation.'
    });
  }
};

export default createTCForm;