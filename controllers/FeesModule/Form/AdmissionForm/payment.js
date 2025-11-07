


import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';

import { AdmissionPayment } from '../../../../models/FeesModule/AdmissionForm.js';
import EaseBuzzData from '../../../../models/EasebuzzData.js';



const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8);
};

const getEasebuzzCredentials = async (schoolId) => {
  if (!schoolId) throw new Error('School ID is required');

  const creds = await EaseBuzzData.findOne({ schoolId }).lean();
  if (!creds) {
    throw new Error('Payment getway credentials not configured for this school');
  }

  return {
    key: creds.EASEBUZZ_KEY,
    salt: creds.EASEBUZZ_SALT,
  };
};

const generateEasebuzzHash = (data, salt) => {
  try {
    const hashString =
      [
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
      ].join('|') + '|' + salt;

    return crypto.createHash('sha512').update(hashString).digest('hex');
  } catch (error) {
    console.error('Hash generation error:', error);
    throw error;
  }
};

const verifyEasebuzzResponseHash = (data, salt) => {
  try {

    const hashString =
      [
        salt,
        data.status || '',
        data.udf10 || '',
        data.udf9 || '',
        data.udf8 || '',
        data.udf7 || '',
        data.udf6 || '',
        data.udf5 || '',
        data.udf4 || '',
        data.udf3 || '',
        data.udf2 || '',
        data.udf1 || '',
        data.email || '',
        data.firstname || '',
        data.productinfo || '',
        data.amount || '',
        data.txnid || ''
      ].join('|');

    const generated = crypto.createHash('sha512').update(hashString).digest('hex');
    return generated === (data.hash || '');
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
};

const validatePaymentData = (body) => {
  const errors = [];

  if (!body.finalAmount || isNaN(body.finalAmount) || body.finalAmount <= 0) {
    errors.push('Final amount is required and must be greater than zero.');
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
      errors.push('Concession amount must be a non-negative number when concession type is selected.');
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


  if (paymentMode !== 'Online') {
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
        paymentMode: paymentMode || 'Cash',
        chequeNumber: chequeNumber || '',
        bankName: bankName || '',
        name: name || '',
        paymentDate: new Date(),
        status: 'Paid',
        easebuzzTxnId: null,
        easebuzzResponse: null,
      };

      const newPayment = new AdmissionPayment(paymentData);
      newPayment.$session(session);
      await newPayment.save({ session });
      await session.commitTransaction();

      return res.status(201).json({
        hasError: false,
        message: 'Offline admission payment recorded successfully.',
        payment: newPayment,
      });
    } catch (err) {
      await session.abortTransaction();
      console.error('Offline payment error:', err);
      const msg = err.code === 11000
        ? 'Duplicate transaction or receipt.'
        : err.message || 'Failed to save payment.';
      return res.status(500).json({ hasError: true, message: msg });
    } finally {
      session.endSession();
    }
  }


  if (!process.env.FRONTEND_URL || !process.env.BACKEND_URL) {
    return res.status(500).json({ hasError: true, message: 'Server configuration missing (FRONTEND_URL / BACKEND_URL).' });
  }

  let credentials;
  try {
    credentials = await getEasebuzzCredentials(schoolId);
  } catch (err) {
    return res.status(400).json({ hasError: true, message: err.message });
  }

  const txnId = `TXN${Date.now()}${generateShortId().toUpperCase()}`;
  const amount = parseFloat(finalAmount).toFixed(2);

  const initiateData = {
    key: credentials.key,
    txnid: txnId,
    amount,
    productinfo: `Admission Fee - ${academicYear || '2025-2026'}`,
    firstname: name || 'Student',
    email: email || 'student@example.com',
    phone: phone || '9999999999',
    surl: `${process.env.BACKEND_URL}/payment/admission/success`,
    furl: `${process.env.BACKEND_URL}/payment/admission/failure`,
    hash: '',
    udf1: studentId,
    udf2: schoolId,
    udf3: academicYear,
    udf4: finalAmount,
    udf5: admissionFees || finalAmount,
    udf6: concessionAmount || '0',
    udf7: '',
    udf8: '',
    udf9: '',
    udf10: '',
  };

  initiateData.hash = generateEasebuzzHash(initiateData, credentials.salt);

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
};



const handleAdmissionPaymentSuccess = async (req, res) => {
  const data = req.body;
  console.log('=== ADMISSION SUCCESS CALLBACK ===', JSON.stringify(data, null, 2));

  if (!data.txnid || !data.status) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?error=missing_params&txnId=${data.txnid || 'unknown'}`);
  }

  const schoolId = data.udf2;
  let salt = '';
  try {
    const creds = await EaseBuzzData.findOne({ schoolId }).lean();
    salt = creds?.EASEBUZZ_SALT || '';
  } catch (e) {
    console.error('Failed to fetch salt for hash verification');
  }

  const isHashValid = salt ? verifyEasebuzzResponseHash(data, salt) : false;
  console.log('Hash valid:', isHashValid);

  if (data.status !== 'success') {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?txnId=${data.txnid}&status=${data.status}`);
  }

  const studentId = data.udf1;
  const finalAmount = data.udf4;
  const admissionFees = data.udf5;
  const concessionAmount = data.udf6 || '0';

  if (!mongoose.isValidObjectId(studentId)) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?error=invalid_student`);
  }

  const existing = await AdmissionPayment.findOne({ easebuzzTxnId: data.txnid });
  if (existing) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/success?txnId=${data.txnid}&paymentId=${existing._id}`);
  }

  const paymentData = {
    studentId,
    schoolId,
    academicYear: data.udf3,
    admissionFees: parseFloat(admissionFees) || parseFloat(data.amount),
    concessionType: null,
    concessionAmount: parseFloat(concessionAmount),
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

  return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/success?txnId=${data.txnid}&paymentId=${newPay._id}`);
};



const handleAdmissionPaymentFailure = async (req, res) => {
  const data = req.body;
  console.log('=== ADMISSION FAILURE CALLBACK ===', JSON.stringify(data, null, 2));

  if (!data.txnid) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?error=missing_txnid`);
  }

  const schoolId = data.udf2;
  let salt = '';
  try {
    const creds = await EaseBuzzData.findOne({ schoolId }).lean();
    salt = creds?.EASEBUZZ_SALT || '';
  } catch (e) { }

  const isHashValid = salt ? verifyEasebuzzResponseHash(data, salt) : false;
  console.log('Failure hash valid:', isHashValid);

  const studentId = data.udf1;
  const finalAmount = data.udf4;
  const admissionFees = data.udf5;
  const concessionAmount = data.udf6 || '0';

  let payment = await AdmissionPayment.findOne({ easebuzzTxnId: data.txnid });

  if (payment) {
    payment.status = 'Failed';
    payment.easebuzzResponse = data;
    await payment.save();
  } else if (mongoose.isValidObjectId(studentId)) {
    payment = new AdmissionPayment({
      studentId,
      schoolId,
      academicYear: data.udf3,
      admissionFees: parseFloat(admissionFees) || parseFloat(data.amount),
      concessionType: null,
      concessionAmount: parseFloat(concessionAmount),
      finalAmount: parseFloat(finalAmount) || parseFloat(data.amount),
      paymentMode: 'Online',
      name: data.firstname || '',
      status: 'Failed',
      paymentDate: new Date(),
      easebuzzTxnId: data.txnid,
      easebuzzResponse: data,
    });
    await payment.save();
  }

  return res.redirect(`${process.env.FRONTEND_URL}/payment/admission/failure?txnId=${data.txnid}&status=failed`);
};



export default createAdmissionPayment;
export { handleAdmissionPaymentSuccess, handleAdmissionPaymentFailure };