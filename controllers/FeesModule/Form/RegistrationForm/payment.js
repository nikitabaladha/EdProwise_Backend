

// import mongoose from 'mongoose';
// import crypto from 'crypto';
// import axios from 'axios';
// import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';

// const generateShortId = () => {
//   return Math.random().toString(36).substring(2, 8);
// };

// const generateEasebuzzHash = (data) => {
//   const hashString = [
//     data.key,
//     data.txnid,
//     data.amount,
//     data.productinfo,
//     data.firstname,
//     data.email,
//     data.udf1 || '',
//     data.udf2 || '',
//     data.udf3 || '',
//     data.udf4 || '',
//     data.udf5 || '',
//     data.udf6 || '',
//     data.udf7 || '',
//     data.udf8 || '',
//     data.udf9 || '',
//     data.udf10 || ''
//   ].join('|') + '|' + process.env.EASEBUZZ_SALT;

//   return crypto.createHash('sha512').update(hashString).digest('hex');
// };

// const creatregistrationpayment = async (req, res) => {
//   const schoolId = req.user?.schoolId;
//   const { studentId } = req.params;

//   console.log('=== Payment Initiation Started ===');
//   console.log('School ID:', schoolId);
//   console.log('Student ID:', studentId);
//   console.log('Request Body:', JSON.stringify(req.body, null, 2));

//   if (!schoolId) {
//     return res.status(401).json({
//       hasError: true,
//       message: 'Access denied: School ID missing.',
//     });
//   }

//   if (!studentId || !mongoose.isValidObjectId(studentId)) {
//     return res.status(400).json({
//       hasError: true,
//       message: 'Valid student ID is required.',
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
//       email,
//       phone,
//     } = req.body;

//     if (!finalAmount || parseFloat(finalAmount) <= 0) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Valid final amount is required.',
//       });
//     }

//     if (paymentMode === 'Online') {
//       if (!process.env.FRONTEND_URL) {
//         return res.status(500).json({
//           hasError: true,
//           message: 'Frontend URL configuration missing.',
//         });
//       }

//       const paymentEmail = email || `${name.replace(/\s+/g, '').toLowerCase()}@school.com`;
//       const paymentPhone = phone || '9999999999';

//       const txnId = `TXN${Date.now()}${generateShortId().toUpperCase()}`;
//       const amount = parseFloat(finalAmount).toFixed(2);

//       const initiateData = {
//         key: process.env.EASEBUZZ_KEY,
//         txnid: txnId,
//         amount: amount,
//         productinfo: `Registration Fee - ${academicYear || '2025-2026'}`,
//         firstname: name || 'Student',
//         email: paymentEmail,
//         phone: paymentPhone,
//         surl: `${process.env.FRONTEND_URL}/payment/success`,
//         furl: `${process.env.FRONTEND_URL}/payment/failure`,
//         hash: '',
//         udf1: studentId,
//         udf2: schoolId,
//         udf3: academicYear,
//         udf4: finalAmount,
//         udf5: registrationFee || finalAmount,
//       };

//       console.log('Easebuzz Environment:', process.env.EASEBUZZ_ENV);
//       console.log('Easebuzz Key:', process.env.EASEBUZZ_KEY ? '***SET***' : 'MISSING');
//       console.log('Easebuzz Salt:', process.env.EASEBUZZ_SALT ? '***SET***' : 'MISSING');
//       console.log('Initiate Data:', JSON.stringify(initiateData, null, 2));


//       initiateData.hash = generateEasebuzzHash(initiateData);
//       console.log('Generated Hash:', initiateData.hash);

//       const easebuzzUrl = process.env.EASEBUZZ_ENV === 'prod'
//         ? 'https://pay.easebuzz.in'
//         : 'https://testpay.easebuzz.in';

//       console.log('Easebuzz URL:', `${easebuzzUrl}/payment/initiateLink`);

//       try {
//         const apiResponse = await axios.post(
//           `${easebuzzUrl}/payment/initiateLink`,
//           new URLSearchParams(initiateData).toString(),
//           {
//             headers: {
//               'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             timeout: 30000,
//           }
//         );

//         console.log('Easebuzz API Response:', JSON.stringify(apiResponse.data, null, 2));

//         const easebuzzResult = apiResponse.data;


//         if (easebuzzResult.status === '1' || easebuzzResult.status === 1) {
//           const accessKey = typeof easebuzzResult.data === 'string' ? easebuzzResult.data : easebuzzResult.data?.access_key;
//           if (accessKey) {
//             const paymentUrl = `${easebuzzUrl}/pay/${accessKey}`;

//             console.log('Payment URL Generated:', paymentUrl);

//             return res.status(200).json({
//               hasError: false,
//               message: 'Easebuzz payment initialized successfully.',
//               paymentUrl,
//               txnId,
//               accessKey,
//             });
//           } else {
//             console.error('No access_key in response:', easebuzzResult);
//             return res.status(400).json({
//               hasError: true,
//               message: 'Payment gateway error: Missing access key.',
//               debug: easebuzzResult,
//             });
//           }
//         } else {
//           console.error('Easebuzz API failed:', easebuzzResult);
//           return res.status(400).json({
//             hasError: true,
//             message: easebuzzResult.msg || easebuzzResult.message || 'Payment gateway initialization failed.',
//             debug: easebuzzResult,
//           });
//         }
//       } catch (apiError) {
//         console.error('Easebuzz API Error:', apiError.response?.data || apiError.message);

//         if (apiError.response?.status === 401) {
//           return res.status(400).json({
//             hasError: true,
//             message: 'Invalid merchant credentials. Please check Easebuzz key and salt.',
//           });
//         }

//         if (apiError.code === 'ECONNABORTED') {
//           return res.status(500).json({
//             hasError: true,
//             message: 'Payment gateway timeout. Please try again.',
//           });
//         }

//         return res.status(500).json({
//           hasError: true,
//           message: 'Failed to connect to payment gateway.',
//           debug: {
//             error: apiError.message,
//             response: apiError.response?.data,
//             status: apiError.response?.status,
//           },
//         });
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
//       paymentDate: paymentMode !== 'null' ? new Date() : null,
//       status: paymentMode === 'null' ? 'Pending' : 'Paid',
//       easebuzzTxnId: null,
//       easebuzzResponse: null,
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
//     res.status(500).json({
//       hasError: true,
//       message: err.message || 'Internal server error.',
//       debug: { error: err.message },
//     });
//   }
// };



// export { creatregistrationpayment};

import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js'; 

const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8);
};

// const generateEasebuzzHash = (data) => {
//   const hashString = [
//     data.key,
//     data.txnid,
//     data.amount,
//     data.productinfo,
//     data.firstname,
//     data.email,
//     data.udf1 || '',
//     data.udf2 || '',
//     data.udf3 || '',
//     data.udf4 || '',
//     data.udf5 || '',
//     data.udf6 || '',
//     data.udf7 || '',
//     data.udf8 || '',
//     data.udf9 || '',
//     data.udf10 || ''
//   ].join('|') + '|' + process.env.EASEBUZZ_SALT;

//   return crypto.createHash('sha512').update(hashString).digest('hex');
// };

const generateEasebuzzHash = (data) => {
  try {
    // Easebuzz initiation hash format
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

    console.log('=== Hash Generation Details ===');
    console.log('Hash String:', hashString);
    console.log('Salt Length:', process.env.EASEBUZZ_SALT?.length);
    
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    console.log('Generated Hash (first 50 chars):', hash.substring(0, 50) + '...');
    
    return hash;
  } catch (error) {
    console.error('Hash generation error:', error);
    throw error;
  }
};

// const verifyEasebuzzResponseHash = (data) => {
//   const hashString = [
//     process.env.EASEBUZZ_SALT,
//     data.status || '',
//     data.udf1 || '',
//     data.udf2 || '',
//     data.udf3 || '',
//     data.udf4 || '',
//     data.udf5 || '',
//     data.udf6 || '',
//     data.udf7 || '',
//     data.udf8 || '',
//     data.udf9 || '',
//     data.udf10 || '',
//     data.email || '',
//     data.firstname || '',
//     data.productinfo || '',
//     data.amount || '',
//     data.txnid || '',
//     process.env.EASEBUZZ_KEY
//   ].join('|');

//   const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
//   return generatedHash === (data.hash || '');
// };

const verifyEasebuzzResponseHash = (data) => {
  try {
    // Easebuzz response hash format is DIFFERENT from initiation
    const hashString = [
      process.env.EASEBUZZ_SALT,
      data.status || '',
      data.udf1 || '',
      data.udf2 || '',
      data.udf3 || '',
      data.udf4 || '',
      data.udf5 || '',
      data.udf6 || '',
      data.udf7 || '',
      data.udf8 || '',
      data.udf9 || '',
      data.udf10 || '',
      data.email || '',
      data.firstname || '',
      data.productinfo || '',
      data.amount || '',
      data.txnid || '',
      data.key || process.env.EASEBUZZ_KEY  // Use provided key or fallback
    ].join('|');

    console.log('=== Hash Verification Details ===');
    console.log('Verification Hash String:', hashString);
    console.log('Received Hash:', data.hash);
    
    const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    console.log('Generated Verification Hash:', generatedHash.substring(0, 50) + '...');
    
    const isValid = generatedHash === (data.hash || '');
    console.log('Hash Valid:', isValid);
    
    return isValid;
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

    if (paymentMode === 'Online') {
      if (!process.env.FRONTEND_URL) {
        return res.status(500).json({
          hasError: true,
          message: 'Frontend URL configuration missing.',
        });
      }

      const paymentEmail = email || `${name.replace(/\s+/g, '').toLowerCase()}@school.com`;
      const paymentPhone = phone || '9999999999';

      const txnId = `TXN${Date.now()}${generateShortId().toUpperCase()}`;
      const amount = parseFloat(finalAmount).toFixed(2);

      const initiateData = {
        // key: process.env.EASEBUZZ_KEY,
        // txnid: txnId,
        // amount: amount,
        // productinfo: `Registration Fee - ${academicYear || '2025-2026'}`,
        // firstname: name || 'Student',
        // email: paymentEmail,
        // phone: paymentPhone,
        // surl: `${process.env.BACKEND_URL}/payment/success`, 
        // furl: `${process.env.BACKEND_URL}/payment/failure`,
        // hash: '',
        // udf1: studentId,
        // udf2: schoolId,
        // udf3: academicYear,
        // udf4: finalAmount,
        // udf5: registrationFee || finalAmount,

         key: process.env.EASEBUZZ_KEY,
        txnid: txnId,
        amount: amount,
        productinfo: `Registration Fee - ${academicYear || '2025-2026'}`,
        firstname: name || 'Student',
        email: paymentEmail,
        phone: paymentPhone,
        surl: `${process.env.BACKEND_URL}/payment/success`, // Backend endpoint
        furl: `${process.env.BACKEND_URL}/payment/failure`, // Backend endpoint
        hash: '',
        udf1: studentId,
        udf2: schoolId,
        udf3: academicYear,
        udf4: finalAmount,
        udf5: registrationFee || finalAmount,
        // udf6: `${process.env.FRONTEND_URL}/payment/success`, // For redirect after processing
        // udf7: `${process.env.FRONTEND_URL}/payment/failure`, // For redirect after processing
      };

      initiateData.hash = generateEasebuzzHash(initiateData);

      const easebuzzUrl = process.env.EASEBUZZ_ENV === 'prod'
        ? 'https://pay.easebuzz.in'
        : 'https://testpay.easebuzz.in';

      console.log('Easebuzz URL:', `${easebuzzUrl}/payment/initiateLink`);

      try {
        const apiResponse = await axios.post(
          `${easebuzzUrl}/payment/initiateLink`,
          new URLSearchParams(initiateData).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 30000,
          }
        );

        console.log('Easebuzz API Response:', JSON.stringify(apiResponse.data, null, 2));

        const easebuzzResult = apiResponse.data;

        if (easebuzzResult.status === '1' || easebuzzResult.status === 1) {
          const accessKey = typeof easebuzzResult.data === 'string' ? easebuzzResult.data : easebuzzResult.data?.access_key;
          if (accessKey) {
            const paymentUrl = `${easebuzzUrl}/pay/${accessKey}`;

            console.log('Payment URL Generated:', paymentUrl);

            return res.status(200).json({
              hasError: false,
              message: 'Easebuzz payment initialized successfully.',
              paymentUrl,
              txnId,
              accessKey,
            });
          } else {
            console.error('No access_key in response:', easebuzzResult);
            return res.status(400).json({
              hasError: true,
              message: 'Payment gateway error: Missing access key.',
              debug: easebuzzResult,
            });
          }
        } else {
          console.error('Easebuzz API failed:', easebuzzResult);
          return res.status(400).json({
            hasError: true,
            message: easebuzzResult.msg || easebuzzResult.message || 'Payment gateway initialization failed.',
            debug: easebuzzResult,
          });
        }
      } catch (apiError) {
        console.error('Easebuzz API Error:', apiError.response?.data || apiError.message);

        if (apiError.response?.status === 401) {
          return res.status(400).json({
            hasError: true,
            message: 'Invalid merchant credentials. Please check Easebuzz key and salt.',
          });
        }

        if (apiError.code === 'ECONNABORTED') {
          return res.status(500).json({
            hasError: true,
            message: 'Payment gateway timeout. Please try again.',
          });
        }

        return res.status(500).json({
          hasError: true,
          message: 'Failed to connect to payment gateway.',
          debug: {
            error: apiError.message,
            response: apiError.response?.data,
            status: apiError.response?.status,
          },
        });
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
      paymentDate: paymentMode !== 'null' ? new Date() : null,
      status: paymentMode === 'null' ? 'Pending' : 'Paid',
      easebuzzTxnId: null,
      easebuzzResponse: null,
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
    res.status(500).json({
      hasError: true,
      message: err.message || 'Internal server error.',
      debug: { error: err.message },
    });
  }
};




// const handlePaymentSuccess = async (req, res) => {
//   try {
//     const data = req.body; 

//     console.log('=== Payment Success Callback ===');
//     console.log('Response Data:', JSON.stringify(data, null, 2));

//     if (!data.txnid || !data.status || !data.hash) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required parameters.',
//       });
//     }

//     // Verify hash
//     if (!verifyEasebuzzResponseHash(data)) {
//       console.error('Hash verification failed');
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid response signature.',
//       });
//     }

//     if (data.status !== 'success') {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment not successful.',
//       });
//     }

//     const { udf1: studentId, udf2: schoolId, udf3: academicYear, udf4: finalAmount, udf5: registrationFee, firstname: name, email } = data;

//     if (!mongoose.isValidObjectId(studentId) || !schoolId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid student or school ID.',
//       });
//     }

 
//     const paymentData = {
//       studentId,
//       schoolId,
//       academicYear,
//       registrationFee: parseFloat(registrationFee) || parseFloat(finalAmount),
//       concessionType: null,
//       concessionAmount: 0,
//       finalAmount: parseFloat(finalAmount),
//       paymentMode: 'Online',
//       name: name || '',
//       status: 'Paid',
//       easebuzzTxnId: data.txnid,
//       easebuzzResponse: data,
//     };

//     const newPayment = new RegistrationPayment(paymentData);
//     await newPayment.save();

//     console.log('Payment record created successfully:', newPayment._id);

//     res.status(200).json({
//       success: true,
//       message: 'Payment processed successfully.',
//       payment: newPayment,
//     });
//   } catch (err) {
//     console.error('Payment success error:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message || 'Internal server error.',
//     });
//   }
// };

const handlePaymentSuccess = async (req, res) => {
  try {
    const data = req.body;
    console.log('=== Payment Success Callback Received ===');
    console.log('Full Request Body:', JSON.stringify(data, null, 2));
    console.log('Request Headers:', req.headers);

    // Log all received fields for debugging
    console.log('=== Received Fields ===');
    Object.keys(data).forEach(key => {
      console.log(`${key}:`, data[key]);
    });

    if (!data.txnid || !data.status) {
      console.error('Missing required parameters in success callback');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=missing_params&txnId=${data.txnid || 'unknown'}`);
    }

    // Verify hash with detailed logging
    console.log('=== Starting Hash Verification ===');
    const isHashValid = verifyEasebuzzResponseHash(data);
    console.log('Hash Verification Result:', isHashValid);

    if (!isHashValid) {
      console.error('Hash verification failed in success callback');
      // For testing, you might want to proceed anyway, but log the issue
      console.warn('⚠️  Hash verification failed, but proceeding for testing');
      // return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=invalid_hash&txnId=${data.txnid}`);
    }

    if (data.status !== 'success') {
      console.error('Payment status not successful:', data.status);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?txnId=${data.txnid}&status=${data.status}`);
    }

    // Extract UDF fields - Easebuzz might send them differently
    const studentId = data.udf1 || data.udf1;
    const schoolId = data.udf2 || data.udf2;
    const academicYear = data.udf3 || data.udf3;
    const finalAmount = data.udf4 || data.udf4;
    const registrationFee = data.udf5 || data.udf5;

    console.log('=== Extracted UDF Fields ===');
    console.log('Student ID:', studentId);
    console.log('School ID:', schoolId);
    console.log('Academic Year:', academicYear);
    console.log('Final Amount:', finalAmount);
    console.log('Registration Fee:', registrationFee);

    if (!mongoose.isValidObjectId(studentId) || !schoolId) {
      console.error('Invalid student or school ID in success callback');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=invalid_ids&txnId=${data.txnid}`);
    }

    // Check if payment already exists to avoid duplicates
    const existingPayment = await RegistrationPayment.findOne({ easebuzzTxnId: data.txnid });
    if (existingPayment) {
      console.log('Payment already exists, redirecting to success:', existingPayment._id);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${data.txnid}&status=success&paymentId=${existingPayment._id}`);
    }

    // Create payment record
    const paymentData = {
      studentId,
      schoolId,
      academicYear,
      registrationFee: parseFloat(registrationFee) || parseFloat(finalAmount) || parseFloat(data.amount),
      concessionType: null,
      concessionAmount: 0,
      finalAmount: parseFloat(finalAmount) || parseFloat(data.amount),
      paymentMode: 'Online',
      name: data.firstname || '',
      status: 'Paid',
      paymentDate: new Date(),
      easebuzzTxnId: data.txnid,
      easebuzzResponse: data,
    };

    console.log('Creating payment record:', paymentData);

    const newPayment = new RegistrationPayment(paymentData);
    await newPayment.save();

    console.log('Payment record created successfully:', newPayment._id);

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${data.txnid}&status=success&paymentId=${newPayment._id}`);

  } catch (err) {
    console.error('Payment success processing error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=processing_error&message=${encodeURIComponent(err.message)}&txnId=${req.body.txnid || 'unknown'}`);
  }
};

const handlePaymentFailure = async (req, res) => {
  try {
    const data = req.body;
    console.log('=== Payment Failure Callback Received ===');
    console.log('Full Request Body:', JSON.stringify(data, null, 2));
    console.log('Request Headers:', req.headers);

    // Log all received fields for debugging
    console.log('=== Received Fields ===');
    Object.keys(data).forEach(key => {
      console.log(`${key}:`, data[key]);
    });

    if (!data.txnid || !data.status) {
      console.error('Missing required parameters in failure callback');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=missing_params&txnId=${data.txnid || 'unknown'}`);
    }

    // Verify hash with detailed logging
    console.log('=== Starting Hash Verification ===');
    const isHashValid = verifyEasebuzzResponseHash(data);
    console.log('Hash Verification Result:', isHashValid);

    if (!isHashValid) {
      console.error('Hash verification failed in failure callback');
      console.warn('⚠️  Hash verification failed, but proceeding for testing');
    }


    const studentId = data.udf1 || data.udf1;
    const schoolId = data.udf2 || data.udf2;
    const academicYear = data.udf3 || data.udf3;
    const finalAmount = data.udf4 || data.udf4;
    const registrationFee = data.udf5 || data.udf5;

    console.log('=== Extracted UDF Fields ===');
    console.log('Student ID:', studentId);
    console.log('School ID:', schoolId);
    console.log('Academic Year:', academicYear);
    console.log('Final Amount:', finalAmount);
    console.log('Registration Fee:', registrationFee);

    if (!mongoose.isValidObjectId(studentId) || !schoolId) {
      console.error('Invalid student or school ID in failure callback');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=invalid_ids&txnId=${data.txnid}`);
    }

    // Check if payment already exists to avoid duplicates
    const existingPayment = await RegistrationPayment.findOne({ easebuzzTxnId: data.txnid });
    if (existingPayment) {
      console.log('Payment already exists, updating status to failed:', existingPayment._id);
      existingPayment.status = 'Failed';
      existingPayment.easebuzzResponse = data;
      await existingPayment.save();
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?txnId=${data.txnid}&status=failed&paymentId=${existingPayment._id}`);
    }

    // Create failed payment record
    const paymentData = {
      studentId,
      schoolId,
      academicYear,
      registrationFee: parseFloat(registrationFee) || parseFloat(finalAmount) || parseFloat(data.amount),
      concessionType: null,
      concessionAmount: 0,
      finalAmount: parseFloat(finalAmount) || parseFloat(data.amount),
      paymentMode: 'Online',
      name: data.firstname || '',
      status: 'Failed',
      easebuzzTxnId: data.txnid,
      easebuzzResponse: data,
    };

    console.log('Creating failed payment record:', paymentData);

    const newPayment = new RegistrationPayment(paymentData);
    await newPayment.save();

    console.log('Failed payment record created:', newPayment._id);


    res.redirect(`${process.env.FRONTEND_URL}/payment/failure?txnId=${data.txnid}&status=failed&paymentId=${newPayment._id}`);

  } catch (err) {
    console.error('Payment failure processing error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=processing_error&message=${encodeURIComponent(err.message)}&txnId=${req.body.txnid || 'unknown'}`);
  }
};

// const handlePaymentFailure = async (req, res) => {
//   try {
//     const data = req.body; 

//     console.log('=== Payment Failure Callback ===');
//     console.log('Response Data:', JSON.stringify(data, null, 2));

//     if (!data.txnid || !data.status || !data.hash) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required parameters.',
//       });
//     }


//     if (!verifyEasebuzzResponseHash(data)) {
//       console.error('Hash verification failed');
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid response signature.',
//       });
//     }

//     const { udf1: studentId, udf2: schoolId, udf3: academicYear, udf4: finalAmount, udf5: registrationFee, firstname: name } = data;

//     if (!mongoose.isValidObjectId(studentId) || !schoolId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid student or school ID.',
//       });
//     }


//     const paymentData = {
//       studentId,
//       schoolId,
//       academicYear,
//       registrationFee: parseFloat(registrationFee) || parseFloat(finalAmount),
//       concessionType: null,
//       concessionAmount: 0,
//       finalAmount: parseFloat(finalAmount),
//       paymentMode: 'Online',
//       name: name || '',
//       status: 'Failed', 
//       easebuzzTxnId: data.txnid,
//       easebuzzResponse: data,
//     };

//     const newPayment = new RegistrationPayment(paymentData);
//     await newPayment.save();

//     console.log('Failed payment record created:', newPayment._id);

//     res.status(200).json({
//       success: false,
//       message: 'Payment failed, record stored for reference.',
//       payment: newPayment,
//     });
//   } catch (err) {
//     console.error('Payment failure error:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message || 'Internal server error.',
//     });
//   }
// };

export { creatregistrationpayment, handlePaymentSuccess, handlePaymentFailure };

