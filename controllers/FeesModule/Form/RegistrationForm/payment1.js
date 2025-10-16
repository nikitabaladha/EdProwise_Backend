// import mongoose from 'mongoose';
// import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';

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

// const createPayment = async (req, res) => {
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

//   try {
//     const {
//       academicYear,
//       registrationFee,
//       concessionType,
//       concessionAmount,
//       finalAmount,
//       paymentMode,
//       chequeNumber,
//       bankName,
//       name,
//     } = req.body;

//     const student = await mongoose
//       .model('StudentRegistration')
//       .findOne({ _id: studentId, schoolId });
//     if (!student) {
//       throw new Error('Student not found or does not belong to your school.');
//     }

//     const paymentData = {
//       studentId,
//       schoolId,
//       academicYear,
//       // registrationNumber: student.registrationNumber || '', 
//       registrationFee: parseFloat(registrationFee) || 0,
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

//     const newPayment = new RegistrationPayment(paymentData);
//     await newPayment.save();

//     res.status(201).json({
//       hasError: false,
//       message: 'Payment created successfully.',
//       payment: newPayment,
//     });
//   } catch (err) {
//     console.error('Payment creation error:', err);
//     const message =
//       err.code === 11000
//         ? 'Receipt number or transaction number already exists.'
//         : err.message || 'An error occurred during payment creation.';
//     res.status(500).json({
//       hasError: true,
//       message,
//       details: 'An error occurred. No changes were saved.',
//     });
//   }
// };

// export default createPayment;


//Razor Pay

import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';

const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8); 
};


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

const createPayment = async (req, res) => {
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
      message: 'Valid student ID is required in the URL path.',
    });
  }

  const paymentErrors = validatePaymentData(req.body);
  if (paymentErrors.length > 0) {
    return res.status(400).json({
      hasError: true,
      message: paymentErrors.join(' '),
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
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    const student = await mongoose
      .model('StudentRegistration')
      .findOne({ _id: studentId, schoolId });
    console.log('Student found:', student);
    if (!student) {
      throw new Error('Student not found or does not belong to your school.');
    }

    if (paymentMode === 'Online') {
      if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
        const generatedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        if (generatedSignature !== razorpaySignature) {
          return res.status(400).json({
            hasError: true,
            message: 'Invalid payment signature.',
          });
        }
      } else {
        const receipt = `rec_${studentId.slice(0, 10)}_${generateShortId()}`; 
        if (receipt.length > 40) {
          throw new Error('Generated receipt exceeds 40 characters.');
        }

        try {
          const order = await razorpay.orders.create({
            amount: parseFloat(finalAmount) * 100, 
            currency: 'INR',
            receipt: receipt,
          });
          return res.status(200).json({
            hasError: false,
            message: 'Razorpay order created successfully.',
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
          });
        } catch (razorpayError) {
          console.error('Razorpay order creation error:', razorpayError);
          throw razorpayError;
        }
      }
    }

    const paymentData = {
      studentId,
      schoolId,
      academicYear,
      registrationFee: parseFloat(registrationFee) || 0,
      concessionType: concessionType || null,
      concessionAmount: parseFloat(concessionAmount) || 0,
      finalAmount: parseFloat(finalAmount),
      paymentMode: paymentMode || 'null',
      chequeNumber: chequeNumber || '',
      bankName: bankName || '',
      name: name || '',
      paymentDate: paymentMode === 'Cash' || paymentMode === 'Cheque' || paymentMode === 'Online' ? new Date() : null,
      status: paymentMode === 'null' ? 'Pending' : 'Paid',
      razorpayPaymentId: razorpayPaymentId || null,
      razorpayOrderId: razorpayOrderId || null,
    };

    const newPayment = new RegistrationPayment(paymentData);
    await newPayment.save();

    res.status(201).json({
      hasError: false,
      message: 'Payment created successfully.',
      payment: newPayment,
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    const message =
      err.code === 11000
        ? 'Receipt number or transaction number already exists.'
        : err.message || 'An error occurred during payment creation.';
    res.status(500).json({
      hasError: true,
      message,
      details: 'An error occurred. No changes were saved.',
    });
  }
};

export default createPayment;

// import mongoose from 'mongoose';
// import crypto from 'crypto';
// import axios from 'axios';
// import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';

// const generateShortId = () => {
//   return Math.random().toString(36).substring(2, 8);
// };


// const easebuzzConfig = {
//   key: process.env.EASEBUZZ_TEST_KEY,
//   salt: process.env.EASEBUZZ_TEST_SALT,
//   env: 'test',
// };


// const EASEBUZZ_API_URL = 'https://testdashboard.easebuzz.in';

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

// const createPayment = async (req, res) => {
//   const schoolId = req.user?.schoolId;
//   const { studentId } = req.params;

//   if (!schoolId) {
//     return res.status(401).json({
//       hasConstants: true,
//       message: 'Access denied: School ID missing.',
//     });
//   }

//   if (!studentId || !mongoose.isValidObjectId(studentId)) {
//     return res.status(400).json({
//       hasConstants: true,
//       message: 'Valid student ID is required in the URL path.',
//     });
//   }

//   const paymentConstants = validatePaymentData(req.body);
//   if (paymentConstants.length > 0) {
//     return res.status(400).json({
//       hasConstants: true,
//       message: paymentConstants.join(' '),
//     });
//   }

//   try {
//     const {
//       academicYear,
//       registrationFee,
//       concessionType,
//       concessionAmount,
//       finalAmount,
//       paymentMode,
//       chequeNumber,
//       bankName,
//       name,
//       easebuzzPaymentId,
//       easebuzzOrderId,
//       easebuzzSignature,
//     } = req.body;

//     const student = await mongoose
//       .model('StudentRegistration')
//       .findOne({ _id: studentId, schoolId });
//     console.log('Student found:', student);
//     if (!student) {
//       throw new Error('Student not found or does not belong to your school.');
//     }

//     if (paymentMode === 'Online') {
//       if (easebuzzPaymentId && easebuzzOrderId && easebuzzSignature) {
//         const dataString = `${easebuzzConfig.key}|${easebuzzOrderId}|${easebuzzPaymentId}|${finalAmount}`;
//         const generatedSignature = crypto
//           .createHmac('sha256', easebuzzConfig.salt)
//           .update(dataString)
//           .digest('hex');

//         if (generatedSignature !== easebuzzSignature) {
//           return res.status(400).json({
//             hasConstants: true,
//             message: 'Invalid payment signature.',
//           });
//         }
//       } else {
//         const receipt = `rec_${studentId.slice(0, 10)}_${generateShortId()}`;
//         if (receipt.length > 40) {
//           throw new Error('Generated receipt exceeds 40 characters.');
//         }

//         try {
//           const easebuzzPayload = {
//             key: easebuzzConfig.key,
//             txnid: receipt,
//             amount: parseFloat(finalAmount).toFixed(2),
//             productinfo: `Registration Fee for ${name}`,
//             firstname: name.split(' ')[0],
//             email: student.email || 'test@example.com',
//             phone: student.phone || '9999999999',
//             surl: `${process.env.SERVER_URL}/easebuzz/success`,
//             furl: `${process.env.SERVER_URL}/easebuzz/failure`,
//           };

//           const response = await axios.post(`${EASEBUZZ_API_URL}/transaction/v1/initiate`, easebuzzPayload, {
//             headers: {
//               'Content-Type': 'application/json',
//               'Accept': 'application/json',
//             },
//           });

//           if (response.data.status === 1 && response.data.data.payment_url) {
//             return res.status(200).json({
//               hasConstants: false,
//               message: 'Easebuzz payment URL generated successfully.',
//               paymentUrl: response.data.data.payment_url,
//               txnid: receipt,
//               amount: easebuzzPayload.amount,
//             });
//           } else {
//             throw new Error(response.data.msg || 'Failed to create Easebuzz payment URL.');
//           }
//         } catch (error) {
//           console.error('Easebuzz order creation error:', error);
//           throw new Error(error.response?.data?.msg || 'Failed to create Easebuzz payment URL.');
//         }
//       }
//     }

//     const paymentData = {
//       studentId,
//       schoolId,
//       academicYear,
//       registrationFee: parseFloat(registrationFee) || 0,
//       concessionType: concessionType || null,
//       concessionAmount: parseFloat(concessionAmount) || 0,
//       finalAmount: parseFloat(finalAmount),
//       paymentMode: paymentMode || 'null',
//       chequeNumber: chequeNumber || '',
//       bankName: bankName || '',
//       name: name || '',
//       paymentDate: paymentMode === 'Cash' || paymentMode === 'Cheque' || paymentMode === 'Online' ? new Date() : null,
//       status: paymentMode === 'null' ? 'Pending' : 'Paid',
//       easebuzzPaymentId: easebuzzPaymentId || null,
//       easebuzzOrderId: easebuzzOrderId || null,
//     };

//     const newPayment = new RegistrationPayment(paymentData);
//     await newPayment.save();

//     res.status(201).json({
//       hasConstants: false,
//       message: 'Payment created successfully.',
//       payment: newPayment,
//     });
//   } catch (err) {
//     console.error('Payment creation error:', err);
//     const message =
//       err.code === 11000
//         ? 'Receipt number or transaction number already exists.'
//         : err.message || 'An error occurred during payment creation.';
//     res.status(500).json({
//       hasConstants: true,
//       message,
//       details: 'An error occurred. No changes were saved.',
//     });
//   }
// };

// const handleEasebuzzCallback = async (req, res) => {
//   try {
//     const { easebuzz_payment_id, txnid, amount, status, signature } = req.body;
//     const expectedSignature = crypto
//       .createHmac('sha256', easebuzzConfig.salt)
//       .update(`${easebuzzConfig.key}|${txnid}|${easebuzz_payment_id}|${amount}`)
//       .digest('hex');

//     if (signature !== expectedSignature) {
//       return res.status(400).json({
//         hasConstants: true,
//         message: 'Invalid payment signature.',
//       });
//     }

//     if (status !== 'success') {
//       return res.status(400).json({
//         hasConstants: true,
//         message: 'Payment failed or was cancelled.',
//       });
//     }

//     const payment = await RegistrationPayment.findOne({ easebuzzOrderId: txnid });
//     if (!payment) {
//       throw new Error('Payment record not found.');
//     }

//     payment.easebuzzPaymentId = easebuzz_payment_id;
//     payment.status = 'Paid';
//     payment.paymentDate = new Date();
//     await payment.save();

//     res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnid=${txnid}`);
//   } catch (err) {
//     console.error('Easebuzz callback error:', err);
//     res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=${encodeURIComponent(err.message)}`);
//   }
// };

// export default createPayment;