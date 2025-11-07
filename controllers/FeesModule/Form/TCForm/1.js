// import mongoose from 'mongoose';
// import { TCPayment } from '../../../../models/FeesModule/TCForm.js';

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

// const createTCPayment = async (req, res) => {
//   const schoolId = req.user?.schoolId;
//   const { tcFormId } = req.params;

//   if (!schoolId) {
//     return res.status(401).json({
//       hasError: true,
//       message: 'Access denied: School ID missing.',
//     });
//   }

//   if (!tcFormId || !mongoose.isValidObjectId(tcFormId)) {
//     return res.status(400).json({
//       hasError: true,
//       message: 'Valid TC form ID is required in the URL path.',
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
//       academicYear,
//       TCfees,
//       concessionType,
//       concessionAmount,
//       finalAmount,
//       paymentMode,
//       chequeNumber,
//       bankName,
//       name,
//     } = req.body;

//     const tcForm = await mongoose
//       .model('TCForm')
//       .findOne({ _id: tcFormId, schoolId })
//       .session(session);
//     if (!tcForm) {
//       throw new Error('TC form not found or does not belong to your school.');
//     }

//     const paymentData = {
//       tcFormId,
//       schoolId,
//       academicYear,
//       TCfees: parseFloat(TCfees) || 0,
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

//     const newPayment = new TCPayment(paymentData);
//     newPayment.$session(session);
//     await newPayment.save({ session });

//     await session.commitTransaction();

//     res.status(201).json({
//       hasError: false,
//       message: 'Payment created successfully.',
//       payment: newPayment,
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     console.error('Payment creation error:', err);
//     const message =
//       err.code === 11000
//         ? 'Receipt number or transaction number already exists.'
//         : err.message || 'An error occurred during payment creation.';
//     res.status(500).json({
//       hasError: true,
//       message,
//       details: 'Transaction aborted. No changes were saved.',
//     });
//   } finally {
//     session.endSession();
//   }
// };

// export default createTCPayment;




import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import { TCPayment } from '../../../../models/FeesModule/TCForm.js';

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




const createTCPayment = async (req, res) => {
  const schoolId = req.user?.schoolId;
  const { tcFormId } = req.params;


  if (!schoolId) {
    return res.status(401).json({ hasError: true, message: 'Access denied: School ID missing.' });
  }
  if (!tcFormId || !mongoose.isValidObjectId(tcFormId)) {
    return res.status(400).json({ hasError: true, message: 'Valid TC form ID is required in the URL path.' });
  }


  const paymentErrors = validatePaymentData(req.body);
  if (paymentErrors.length) {
    return res.status(400).json({ hasError: true, message: paymentErrors.join(' ') });
  }

  const {
    academicYear,
    TCfees,
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

    const txnId = `TC${Date.now()}${generateShortId().toUpperCase()}`;
    const amount = parseFloat(finalAmount).toFixed(2);

    const initiateData = {
      key: process.env.EASEBUZZ_KEY,
      txnid: txnId,
      amount,
      productinfo: `TC Fee - ${academicYear || '2025-2026'}`,
      firstname: name || 'Student',
      email: email || '',
      phone: phone || '',
      surl: `${process.env.BACKEND_URL}/payment/tc/success`,
      furl: `${process.env.BACKEND_URL}/payment/tc/failure`,
      hash: '',
      udf1: tcFormId,
      udf2: schoolId,
      udf3: academicYear,
      udf4: finalAmount,
      udf5: TCfees || finalAmount,
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
      console.error('Easebuzz API error (TC):', e.response?.data || e.message);
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
    const tcForm = await mongoose
      .model('TCForm')
      .findOne({ _id: tcFormId, schoolId })
      .session(session);
    if (!tcForm) {
      throw new Error('TC form not found or does not belong to your school.');
    }

    const paymentData = {
      tcFormId,
      schoolId,
      academicYear,
      TCfees: parseFloat(TCfees) || 0,
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

    const newPayment = new TCPayment(paymentData);
    newPayment.$session(session);
    await newPayment.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      hasError: false,
      message: 'Payment created successfully.',
      payment: newPayment,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('TC payment creation error:', err);
    const message =
      err.code === 11000
        ? 'Receipt number or transaction number already exists.'
        : err.message || 'An error occurred during payment creation.';
    res.status(500).json({
      hasError: true,
      message,
      details: 'Transaction aborted. No changes were saved.',
    });
  } finally {
    session.endSession();
  }
};




const handleTCPaymentSuccess = async (req, res) => {
  const data = req.body;
  console.log('=== TC SUCCESS CALLBACK ===', JSON.stringify(data, null, 2));

  if (!data.txnid || !data.status) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/tc/failure?error=missing_params&txnId=${data.txnid || 'unknown'}`);
  }

  const hashOk = verifyEasebuzzResponseHash(data);
  if (!hashOk) console.warn('TC SUCCESS – hash mismatch (still processing)');

  if (data.status !== 'success') {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/tc/failure?txnId=${data.txnid}&status=${data.status}`);
  }

  const tcFormId = data.udf1;
  const schoolId = data.udf2;
  const academicYear = data.udf3;
  const finalAmount = data.udf4;
  const TCfees = data.udf5;
  const concessionAmount = data.udf6 || '0';

  if (!mongoose.isValidObjectId(tcFormId) || !schoolId) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/tc/failure?error=invalid_ids&txnId=${data.txnid}`);
  }


  const already = await TCPayment.findOne({ easebuzzTxnId: data.txnid });
  if (already) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/tc/success?txnId=${data.txnid}&paymentId=${already._id}`);
  }

  const paymentData = {
    tcFormId,
    schoolId,
    academicYear,
    TCfees: parseFloat(TCfees) || parseFloat(finalAmount) || parseFloat(data.amount),
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

  const newPay = new TCPayment(paymentData);
  await newPay.save();

  res.redirect(`${process.env.FRONTEND_URL}/payment/tc/success?txnId=${data.txnid}&paymentId=${newPay._id}`);
};




const handleTCPaymentFailure = async (req, res) => {
  const data = req.body;
  console.log('=== TC FAILURE CALLBACK ===', JSON.stringify(data, null, 2));

  if (!data.txnid || !data.status) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/tc/failure?error=missing_params&txnId=${data.txnid || 'unknown'}`);
  }

  const hashOk = verifyEasebuzzResponseHash(data);
  if (!hashOk) console.warn('TC FAILURE – hash mismatch');

  const tcFormId = data.udf1;
  const schoolId = data.udf2;
  const academicYear = data.udf3;
  const finalAmount = data.udf4;
  const TCfees = data.udf5;
  const concessionAmount = data.udf6 || '0';

  if (!mongoose.isValidObjectId(tcFormId) || !schoolId) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/tc/failure?error=invalid_ids&txnId=${data.txnid}`);
  }

  const existing = await TCPayment.findOne({ easebuzzTxnId: data.txnid });
  if (existing) {
    existing.status = 'Failed';
    existing.easebuzzResponse = data;
    await existing.save();
    return res.redirect(`${process.env.FRONTEND_URL}/payment/tc/failure?txnId=${data.txnid}&paymentId=${existing._id}`);
  }

  const paymentData = {
    tcFormId,
    schoolId,
    academicYear,
    TCfees: parseFloat(TCfees) || parseFloat(finalAmount) || parseFloat(data.amount),
    concessionType: null,
    concessionAmount: parseFloat(concessionAmount) || 0,
    finalAmount: parseFloat(finalAmount) || parseFloat(data.amount),
    paymentMode: 'Online',
    name: data.firstname || '',
    status: 'Failed',
    easebuzzTxnId: data.txnid,
    easebuzzResponse: data,
  };

  const newPay = new TCPayment(paymentData);
  await newPay.save();

  res.redirect(`${process.env.FRONTEND_URL}/payment/tc/failure?txnId=${data.txnid}&paymentId=${newPay._id}`);
};




export default createTCPayment;
export { handleTCPaymentSuccess, handleTCPaymentFailure };