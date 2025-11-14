import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';

import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';
import EaseBuzzData from '../../../../models/EasebuzzData.js';
import { sendPaymentLinkMail } from './notifications.js';

const generateShortId = () => Math.random().toString(36).substring(2, 8);

const getEasebuzzCredentials = async (schoolId) => {
  if (!schoolId) throw new Error('School ID is required');
  const creds = await EaseBuzzData.findOne({ schoolId }).lean();
  if (!creds) throw new Error('Payment gateway credentials not configured for this school');
  return { key: creds.EASEBUZZ_KEY, salt: creds.EASEBUZZ_SALT };
};

const generateEasebuzzHash = (data, salt) => {
  const hashString =
    [
      data.key, data.txnid, data.amount, data.productinfo, data.firstname,
      data.email, data.udf1 || '', data.udf2 || '', data.udf3 || '',
      data.udf4 || '', data.udf5 || '', data.udf6 || '', data.udf7 || '',
      data.udf8 || '', data.udf9 || '', data.udf10 || '',
    ].join('|') + '|' + salt;
  return crypto.createHash('sha512').update(hashString).digest('hex');
};

const verifyEasebuzzResponseHash = (data, salt) => {
  const hashString =
    [
      salt, data.status || '', data.udf10 || '', data.udf9 || '',
      data.udf8 || '', data.udf7 || '', data.udf6 || '', data.udf5 || '',
      data.udf4 || '', data.udf3 || '', data.udf2 || '', data.udf1 || '',
      data.email || '', data.firstname || '', data.productinfo || '',
      data.amount || '', data.txnid || '',
    ].join('|');
  const generated = crypto.createHash('sha512').update(hashString).digest('hex');
  return generated === (data.hash || '');
};


const creatregistrationpaymentLink = async (req, res) => {
  const schoolId = req.user?.schoolId;
  const { studentId } = req.params;

  if (!schoolId) {
    return res.status(401).json({ hasError: true, message: 'Access denied: School ID missing.' });
  }
  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ hasError: true, message: 'Valid student ID is required.' });
  }

  try {
    const {
      academicYear, registrationFee, concessionType, concessionAmount,
      finalAmount, paymentMode, chequeNumber, bankName, name, email, phone,
    } = req.body;

    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      return res.status(400).json({ hasError: true, message: 'Valid final amount is required.' });
    }


    if (paymentMode !== 'Online') {
      const paymentData = {
        studentId, schoolId, academicYear,
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
      return res.status(500).json({ hasError: true, message: 'URL configuration missing.' });
    }

    const credentials = await getEasebuzzCredentials(schoolId);
    const txnId = `TXN${Date.now()}${generateShortId().toUpperCase()}`;
    const amount = parseFloat(finalAmount).toFixed(2);

    const initiateData = {
      key: credentials.key,
      txnid: txnId,
      amount,
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
      udf7: '', udf8: '', udf9: '', udf10: '',
    };
    initiateData.hash = generateEasebuzzHash(initiateData, credentials.salt);

    const easebuzzUrl = process.env.EASEBUZZ_ENV === 'prod'
      ? 'https://pay.easebuzz.in'
      : 'https://testpay.easebuzz.in';

    const apiResponse = await axios.post(
      `${easebuzzUrl}/payment/initiateLink`,
      new URLSearchParams(initiateData).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 30000 }
    );

    const result = apiResponse.data;
    if (result.status !== '1' && result.status !== 1) {
      console.error('Easebuzz init failed:', result);
      return res.status(400).json({
        hasError: true,
        message: result.msg || 'Payment gateway initialization failed.',
        debug: result,
      });
    }

    const accessKey = typeof result.data === 'string' ? result.data : result.data?.access_key;
    if (!accessKey) {
      return res.status(400).json({ hasError: true, message: 'Access key missing from gateway.' });
    }

    const paymentUrl = `${easebuzzUrl}/pay/${accessKey}`;


    try {
      await sendPaymentLinkMail({
        to: email,
        name: name || 'Student',
        amount: finalAmount,
        txnId,
        paymentUrl,
        academicYear: academicYear || '2025-2026',
      });
    } catch (e) {
      console.error('Email send error:', e);

    }

    return res.status(200).json({
      hasError: false,
      message: 'Payment link sent to your email.',
      txnId,
      paymentId: pendingPayment._id,
    });

  } catch (err) {
    console.error('Payment creation error:', err);
    return res.status(500).json({ hasError: true, message: err.message || 'Internal server error.' });
  }
};


const handlePaymentSuccess = async (req, res) => {
  try {
    const data = req.body;
    if (!data.txnid || !data.status) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=missing_params`);
    }

    const schoolId = data.udf2;
    let salt = '';
    try {
      const creds = await EaseBuzzData.findOne({ schoolId }).lean();
      salt = creds?.EASEBUZZ_SALT || '';
    } catch (_) { }

    const isHashValid = salt ? verifyEasebuzzResponseHash(data, salt) : false;
    console.log('Success hash valid:', isHashValid);

    if (data.status !== 'success') {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?txnId=${data.txnid}&status=${data.status}`);
    }

    const pending = await RegistrationPayment.findOne({
      easebuzzTxnId: data.txnid,
      status: 'Pending',
    });

    if (!pending) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${data.txnid}`);
    }

    pending.status = 'Paid';
    pending.easebuzzId = data.easepayid;
    pending.hash = data.hash;
    pending.easebuzzResponse = data;
    await pending.save();

    return res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${data.txnid}&paymentId=${pending._id}`);
  } catch (err) {
    console.error('Success handler error:', err);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=server`);
  }
};


const handlePaymentFailure = async (req, res) => {
  try {
    const data = req.body;
    if (!data.txnid) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=missing_txnid`);
    }

    const schoolId = data.udf2;
    let salt = '';
    try {
      const creds = await EaseBuzzData.findOne({ schoolId }).lean();
      salt = creds?.EASEBUZZ_SALT || '';
    } catch (_) { }

    const isHashValid = salt ? verifyEasebuzzResponseHash(data, salt) : false;
    console.log('Failure hash valid:', isHashValid);

    let payment = await RegistrationPayment.findOne({ easebuzzTxnId: data.txnid });

    if (payment) {
      payment.status = 'Failed';
      payment.easebuzzResponse = data;
      await payment.save();
    } else {
      const studentId = data.udf1;
      if (mongoose.isValidObjectId(studentId)) {
        payment = new RegistrationPayment({
          studentId,
          schoolId,
          academicYear: data.udf3,
          registrationFee: parseFloat(data.udf5) || parseFloat(data.amount),
          concessionType: null,
          concessionAmount: parseFloat(data.udf6) || 0,
          finalAmount: parseFloat(data.udf4) || parseFloat(data.amount),
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
  creatregistrationpaymentLink,
  handlePaymentSuccess,
  handlePaymentFailure,
};