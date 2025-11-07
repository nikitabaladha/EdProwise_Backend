


import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';

import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';
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

    const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    return generatedHash === (data.hash || '');
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
};



const creatregistrationpayment = async (req, res) => {
  const schoolId = req.user?.schoolId;
  const { studentId } = req.params;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({
      hasError: true,
      message: 'Valid student ID is required.',
    });
  }

  try {
    const {
      academicYear,
      registrationFee,
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

    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      return res.status(400).json({
        hasError: true,
        message: 'Valid final amount is required.',
      });
    }


    if (paymentMode !== 'Online') {
      const paymentData = {
        studentId,
        schoolId,
        academicYear,
        registrationFee: parseFloat(registrationFee) || 0,
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

      const newPayment = new RegistrationPayment(paymentData);
      await newPayment.save();

      return res.status(201).json({
        hasError: false,
        message: 'Offline payment recorded successfully.',
        payment: newPayment,
      });
    }


    if (!process.env.FRONTEND_URL || !process.env.BACKEND_URL) {
      return res.status(500).json({
        hasError: true,
        message: 'Frontend/Backend URL configuration missing.',
      });
    }


    let credentials;
    try {
      credentials = await getEasebuzzCredentials(schoolId);
    } catch (err) {
      return res.status(400).json({
        hasError: true,
        message: err.message,
      });
    }

    const txnId = `TXN${Date.now()}${generateShortId().toUpperCase()}`;
    const amount = parseFloat(finalAmount).toFixed(2);

    const initiateData = {
      key: credentials.key,
      txnid: txnId,
      amount: amount,
      productinfo: `Registration Fee - ${academicYear || '2025-2026'}`,
      firstname: name || 'Student',
      email: email || 'student@example.com',
      phone: phone || '9999999999',
      surl: `${process.env.BACKEND_URL}/payment/success`,
      furl: `${process.env.BACKEND_URL}/payment/failure`,
      hash: '',
      udf1: studentId,
      udf2: schoolId,
      udf3: academicYear,
      udf4: finalAmount,
      udf5: registrationFee || finalAmount,
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

    const apiResponse = await axios.post(
      `${easebuzzUrl}/payment/initiateLink`,
      new URLSearchParams(initiateData).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000,
      }
    );

    const easebuzzResult = apiResponse.data;

    if (easebuzzResult.status === '1' || easebuzzResult.status === 1) {
      const accessKey = typeof easebuzzResult.data === 'string' ? easebuzzResult.data : easebuzzResult.data?.access_key;

      if (accessKey) {
        const paymentUrl = `${easebuzzUrl}/pay/${accessKey}`;

        return res.status(200).json({
          hasError: false,
          message: 'Easebuzz payment initialized successfully.',
          paymentUrl,
          txnId,
          accessKey,
        });
      }
    }


    console.error('Easebuzz init failed:', easebuzzResult);
    return res.status(400).json({
      hasError: true,
      message: easebuzzResult.msg || 'Payment gateway initialization failed.',
      debug: easebuzzResult,
    });

  } catch (err) {
    console.error('Payment creation error:', err);
    return res.status(500).json({
      hasError: true,
      message: err.message || 'Internal server error.',
    });
  }
};



const handlePaymentSuccess = async (req, res) => {
  try {
    const data = req.body;
    console.log('SUCCESS CALLBACK:', JSON.stringify(data, null, 2));


    if (!data.txnid || !data.status) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=missing_params`);
    }


    const schoolId = data.udf2;
    let salt = '';
    try {
      const creds = await EaseBuzzData.findOne({ schoolId }).lean();
      salt = creds?.EASEBUZZ_SALT || '';
    } catch (e) {
      console.error('Failed to fetch salt for verification');
    }

    const isHashValid = salt ? verifyEasebuzzResponseHash(data, salt) : false;
    console.log('Hash valid:', isHashValid);


    if (data.status !== 'success') {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?txnId=${data.txnid}&status=${data.status}`);
    }


    const studentId = data.udf1;
    const finalAmount = data.udf4;
    const registrationFee = data.udf5;
    const concessionAmount = data.udf6 || '0';

    if (!mongoose.isValidObjectId(studentId)) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=invalid_student`);
    }


    const existing = await RegistrationPayment.findOne({ easebuzzTxnId: data.txnid });
    if (existing) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${data.txnid}&paymentId=${existing._id}`);
    }


    const paymentData = {
      studentId,
      schoolId,
      academicYear: data.udf3,
      registrationFee: parseFloat(registrationFee) || parseFloat(data.amount),
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

    const newPayment = new RegistrationPayment(paymentData);
    await newPayment.save();

    console.log('Payment saved:', newPayment._id);

    return res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${data.txnid}&paymentId=${newPayment._id}`);

  } catch (err) {
    console.error('Success handler error:', err);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=server`);
  }
};



const handlePaymentFailure = async (req, res) => {
  try {
    const data = req.body;
    console.log('FAILURE CALLBACK:', JSON.stringify(data, null, 2));

    if (!data.txnid) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=missing_txnid`);
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
    const registrationFee = data.udf5;
    const concessionAmount = data.udf6 || '0';


    let payment = await RegistrationPayment.findOne({ easebuzzTxnId: data.txnid });

    if (payment) {
      payment.status = 'Failed';
      payment.easebuzzResponse = data;
      await payment.save();
    } else {
      if (mongoose.isValidObjectId(studentId)) {
        payment = new RegistrationPayment({
          studentId,
          schoolId,
          academicYear: data.udf3,
          registrationFee: parseFloat(registrationFee) || parseFloat(data.amount),
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
    }

    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?txnId=${data.txnid}&status=failed`);

  } catch (err) {
    console.error('Failure handler error:', err);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=server`);
  }
};



export {
  creatregistrationpayment,
  handlePaymentSuccess,
  handlePaymentFailure
};