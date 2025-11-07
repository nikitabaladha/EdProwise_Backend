// import mongoose from 'mongoose';
// import { AdmissionPayment } from '../../../../models/FeesModule/AdmissionForm.js';

// const validatePaymentData = (body) => {
//   const errors = [];

//   if (!body.finalAmount || isNaN(body.finalAmount) || body.finalAmount < 0) {
//     errors.push('Final amount is required and must be a non-negative number.');
//   }

//   if (!body.paymentMode || !['Cash', 'Cheque', 'Online', 'null'].includes(body.paymentMode)) {
//     errors.push('Valid payment mode is required (Cash, Cheque, Online, or null).');
//   }

//   if (!body.name || body.name.trim() === '') {
//     errors.push('Name is required for payment.');
//   }

//   if (body.paymentMode === 'Cheque') {
//     if (!body.bankName || body.bankName.trim() === '') {
//       errors.push('Bank name is required when payment mode is Cheque.');
//     }

//     if (!body.chequeNumber || body.chequeNumber.trim() === '') {
//       errors.push('Cheque number is required when payment mode is Cheque.');
//     } else {
//       const chequeRegex = /^\d{6}$/;
//       if (!chequeRegex.test(body.chequeNumber)) {
//         errors.push('Cheque number must be exactly 6 digits.');
//       }
//     }
//   }

//   if (body.concessionType && body.concessionType !== 'null' && body.concessionType.trim() !== '') {
//     if (!body.concessionAmount || isNaN(body.concessionAmount) || body.concessionAmount < 0) {
//       errors.push('Concession amount is required and must be a non-negative number when concession type is selected.');
//     }
//   }

//   return errors;
// };

// const createAdmissionPayment = async (req, res) => {
//   const schoolId = req.user?.schoolId;
//   const { studentId } = req.params;

//   if (!schoolId) {
//     return res.status(401).json({
//       hasError: true,
//       message: 'Access denied: School ID missing.',
//     });
//   }

//   if (!studentId || !mongoose.isValidObjectId(studentId)) {
//     return res.status(400).json({
//       hasError: true,
//       message: 'Valid student ID is required in the URL path.',
//     });
//   }

//   const paymentErrors = validatePaymentData(req.body);
//   if (paymentErrors.length > 0) {
//     return res.status(400).json({
//       hasError: true,
//       message: paymentErrors.join(' '),
//     });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//        academicYear,
//       admissionFees,
//       concessionType,
//       concessionAmount,
//       finalAmount,
//       paymentMode,
//       chequeNumber,
//       bankName,
//       name,
//     } = req.body;

//     const student = await mongoose
//       .model('AdmissionForm')
//       .findOne({ _id: studentId, schoolId })
//       .session(session);
//     if (!student) {
//       await session.abortTransaction();
//       return res.status(404).json({
//         hasError: true,
//         message: 'Student not found or does not belong to your school.',
//       });
//     }

//     const paymentData = {
//       studentId,
//       schoolId,
//        academicYear,
//       admissionFees: parseFloat(admissionFees) || 0,
//       concessionType: concessionType || null,
//       concessionAmount: parseFloat(concessionAmount) || 0,
//       finalAmount: parseFloat(finalAmount),
//       paymentMode: paymentMode || 'null',
//       chequeNumber: chequeNumber || '',
//       bankName: bankName || '',
//       name: name || '',
//       paymentDate: paymentMode === 'Cash' || paymentMode === 'Cheque' ? new Date() : null,
//       status: paymentMode === 'null' ? 'Pending' : 'Paid',
//     };

//     const newPayment = new AdmissionPayment(paymentData);
//     newPayment.$session(session);
//     await newPayment.save({ session });

//     await session.commitTransaction();

//     res.status(201).json({
//       hasError: false,
//       message: 'Admission payment created successfully.',
//       payment: newPayment,
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     console.error('Admission payment creation error:', err);
//     const message =
//       err.code === 11000
//         ? 'Receipt number or transaction number already exists.'
//         : err.message || 'An error occurred during admission payment creation.';
//     res.status(500).json({
//       hasError: true,
//       message,
//       details: 'Transaction aborted. No changes were saved.',
//     });
//   }
// };

// export default createAdmissionPayment;


import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import { AdmissionPayment } from '../../../../models/FeesModule/AdmissionForm.js';


const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8);
};


const generateEasebuzzHash = (data) => {
  const hashString = [
    data.key,
    data.txnid,
    data.amount,
    data.productinfo,
    data.firstname,
    data.email,
    data.udf1 || '',
    data.udf2 || '',
    data.udf3 || '',
    data.udf4 || '',
    data.udf5 || '',
    data.udf6 || '',
    data.udf7 || '',
    data.udf8 || '',
    data.udf9 || '',
    data.udf10 || ''
  ].join('|') + '|' + process.env.EASEBUZZ_SALT;

  return crypto.createHash('sha512').update(hashString).digest('hex');
};


const verifyEasebuzzResponseHash = (data) => {
  const hashString = [
    process.env.EASEBUZZ_SALT,
    data.status || '',
    data.udf1 || '',
    data.udf2 || '',
    data.udf3 || '',
    data.udf4 || '',
    data.udf5 || '',
    data.udf6 || '',
    data.email || '',
    data.firstname || '',
    data.productinfo || '',
    data.amount || '',
    data.txnid || '',
    data.key || process.env.EASEBUZZ_KEY
  ].join('|');

  const generated = crypto.createHash('sha512').update(hashString).digest('hex');
  return generated === (data.hash || '');
};


const validatePaymentData = (body) => {
  const errors = [];

  if (!body.finalAmount || isNaN(body.finalAmount) || body.finalAmount < 0) {
    errors.push('Final amount is required and must be a non-negative number.');
  }
  if (!body.paymentMode || !['Cash', 'Cheque', 'Online', 'null'].includes(body.paymentMode)) {
    errors.push('Valid payment mode is required (Cash, Cheque, Online, or null).');
  }
  if (!body.name || body.name.trim() === '') {
    errors.push('Name is required for payment.');
  }

  if (body.paymentMode === 'Cheque') {
    if (!body.bankName || body.bankName.trim() === '') {
      errors.push('Bank name is required when payment mode is Cheque.');
    }
    if (!body.chequeNumber || body.chequeNumber.trim() === '') {
      errors.push('Cheque number is required when payment mode is Cheque.');
    } else {
      const chequeRegex = /^\d{6}$/;
      if (!chequeRegex.test(body.chequeNumber)) {
        errors.push('Cheque number must be exactly 6 digits.');
      }
    }
  }

  if (body.concessionType && body.concessionType !== 'null' && body.concessionType.trim() !== '') {
    if (!body.concessionAmount || isNaN(body.concessionAmount) || body.concessionAmount < 0) {
      errors.push('Concession amount is required and must be a non-negative number when concession type is selected.');
    }
  }
  return errors;
};




const createAdmissionPayment = async (req, res) => {
  const schoolId = req.user?.schoolId;
  const { studentId } = req.params;


  if (!schoolId) {
    return res.status(401).json({ hasError: true, message: 'Access denied: School ID missing.' });
  }
  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ hasError: true, message: 'Valid student ID is required in the URL path.' });
  }

  const validationErrors = validatePaymentData(req.body);
  if (validationErrors.length) {
    return res.status(400).json({ hasError: true, message: validationErrors.join(' ') });
  }

  const {
    academicYear,
    admissionFees,
    concessionType,
    concessionAmount,
    finalAmount,
    paymentMode,
    chequeNumber,
    bankName,
    name,
    email,
    phone,
  } = req.body;




  if (paymentMode === 'Online') {
    if (!process.env.FRONTEND_URL || !process.env.BACKEND_URL) {
      return res.status(500).json({ hasError: true, message: 'Server configuration missing (FRONTEND_URL / BACKEND_URL).' });
    }

    const txnId = `TXN${Date.now()}${generateShortId().toUpperCase()}`;
    const amount = parseFloat(finalAmount).toFixed(2);

    const initiateData = {
      key: process.env.EASEBUZZ_KEY,
      txnid: txnId,
      amount,
      productinfo: `Admission Fee - ${academicYear || '2025-2026'}`,
      firstname: name || 'Student',
      email: email || '',
      phone: phone || '',
      surl: `${process.env.BACKEND_URL}/payment/admission/success`,
      furl: `${process.env.BACKEND_URL}/payment/admission/failure`,
      hash: '',
      udf1: studentId,
      udf2: schoolId,
      udf3: academicYear,
      udf4: finalAmount,
      udf5: admissionFees || finalAmount,
      udf6: concessionAmount || '0',
    };

    initiateData.hash = generateEasebuzzHash(initiateData);

    const easebuzzUrl = process.env.EASEBUZZ_ENV === 'prod'
      ? 'https://pay.easebuzz.in'
      : 'https://testpay.easebuzz.in';

    try {
      const apiResp = await axios.post(
        `${easebuzzUrl}/payment/initiateLink`,
        new URLSearchParams(initiateData).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 30000,
        }
      );

      const result = apiResp.data;
      if (result.status === '1' || result.status === 1) {
        const accessKey = typeof result.data === 'string' ? result.data : result.data?.access_key;
        if (!accessKey) {
          return res.status(400).json({ hasError: true, message: 'Missing access_key from Easebuzz.' });
        }
        const paymentUrl = `${easebuzzUrl}/pay/${accessKey}`;
        return res.json({
          hasError: false,
          message: 'Easebuzz payment initialized.',
          paymentUrl,
          txnId,
          accessKey,
        });
      } else {
        return res.status(400).json({
          hasError: true,
          message: result.msg || result.message || 'Easebuzz initialization failed.',
          debug: result,
        });
      }
    } catch (e) {
      console.error('Easebuzz API error:', e.response?.data || e.message);
      return res.status(500).json({
        hasError: true,
        message: 'Failed to connect to payment gateway.',
        debug: e.response?.data || e.message,
      });
    }
  }




  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const student = await mongoose
      .model('AdmissionForm')
      .findOne({ _id: studentId, schoolId })
      .session(session);

    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({ hasError: true, message: 'Student not found or does not belong to your school.' });
    }

    const paymentData = {
      studentId,
      schoolId,
      academicYear,
      admissionFees: parseFloat(admissionFees) || 0,
      concessionType: concessionType || null,
      concessionAmount: parseFloat(concessionAmount) || 0,
      finalAmount: parseFloat(finalAmount),
      paymentMode: paymentMode || 'null',
      chequeNumber: chequeNumber || '',
      bankName: bankName || '',
      name: name || '',
      paymentDate: paymentMode === 'Cash' || paymentMode === 'Cheque' ? new Date() : null,
      status: paymentMode === 'null' ? 'Pending' : 'Paid',
      easebuzzTxnId: null,
      easebuzzResponse: null,
    };

    const newPayment = new AdmissionPayment(paymentData);
    newPayment.$session(session);
    await newPayment.save({ session });
    await session.commitTransaction();

    return res.status(201).json({
      hasError: false,
      message: 'Admission payment created successfully.',
      payment: newPayment,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Admission payment creation error:', err);
    const msg = err.code === 11000
      ? 'Receipt number or transaction number already exists.'
      : err.message || 'An error occurred during admission payment creation.';
    return res.status(500).json({ hasError: true, message: msg });
  } finally {
    session.endSession();
  }
};




const handleAdmissionPaymentSuccess = async (req, res) => {
  const data = req.body;
  console.log('=== ADMISSION SUCCESS CALLBACK ===', JSON.stringify(data, null, 2));

  if (!data.txnid || !data.status) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?error=missing_params&txnId=${data.txnid || 'unknown'}`);
  }

  const hashOk = verifyEasebuzzResponseHash(data);
  if (!hashOk) console.warn('Hash mismatch – still processing for safety');

  if (data.status !== 'success') {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?txnId=${data.txnid}&status=${data.status}`);
  }

  const studentId = data.udf1;
  const schoolId = data.udf2;
  const academicYear = data.udf3;
  const finalAmount = data.udf4;
  const admissionFees = data.udf5;
  const concessionAmount=data.udf6 || data.udf6;

  if (!mongoose.isValidObjectId(studentId) || !schoolId) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?error=invalid_ids&txnId=${data.txnid}`);
  }


  const already = await AdmissionPayment.findOne({ easebuzzTxnId: data.txnid });
  if (already) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/success?txnId=${data.txnid}&paymentId=${already._id}`);
  }

  const paymentData = {
    studentId,
    schoolId,
    academicYear,
    admissionFees: parseFloat(admissionFees) || parseFloat(finalAmount) || parseFloat(data.amount),
    concessionType: null,
    concessionAmount: parseFloat(concessionAmount) || 0,
    finalAmount: parseFloat(finalAmount) || parseFloat(data.amount),
    paymentMode: 'Online',
    name: data.firstname || '',
    status: 'Paid',
    paymentDate: new Date(),
    easebuzzTxnId: data.txnid,
    easebuzzId: data.easepayid,
    hash: data.hash,
    easebuzzResponse: data,
  };

  const newPay = new AdmissionPayment(paymentData);
  await newPay.save();

  res.redirect(`${process.env.FRONTEND_URL}/payment/admission/success?txnId=${data.txnid}&paymentId=${newPay._id}`);
};




const handleAdmissionPaymentFailure = async (req, res) => {
  const data = req.body;
  console.log('=== ADMISSION FAILURE CALLBACK ===', JSON.stringify(data, null, 2));

  if (!data.txnid || !data.status) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?error=missing_params&txnId=${data.txnid || 'unknown'}`);
  }

  const hashOk = verifyEasebuzzResponseHash(data);
  if (!hashOk) console.warn('Hash mismatch on failure');

  const studentId = data.udf1;
  const schoolId = data.udf2;
  const academicYear = data.udf3;
  const finalAmount = data.udf4;
  const admissionFees = data.udf5;

  if (!mongoose.isValidObjectId(studentId) || !schoolId) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?error=invalid_ids&txnId=${data.txnid}`);
  }

  const existing = await AdmissionPayment.findOne({ easebuzzTxnId: data.txnid });
  if (existing) {
    existing.status = 'Failed';
    existing.easebuzzResponse = data;
    await existing.save();
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?txnId=${data.txnid}&paymentId=${existing._id}`);
  }

  const paymentData = {
    studentId,
    schoolId,
    academicYear,
    admissionFees: parseFloat(admissionFees) || parseFloat(finalAmount) || parseFloat(data.amount),
    concessionType: null,
      concessionAmount: parseFloat(concessionAmount) || 0,
    finalAmount: parseFloat(finalAmount) || parseFloat(data.amount),
    paymentMode: 'Online',
    name: data.firstname || '',
    status: 'Failed',
    easebuzzTxnId: data.txnid,
    easebuzzResponse: data,
  };

  const newPay = new AdmissionPayment(paymentData);
  await newPay.save();

  res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?txnId=${data.txnid}&paymentId=${newPay._id}`);
};


export default createAdmissionPayment;
export { handleAdmissionPaymentSuccess, handleAdmissionPaymentFailure };