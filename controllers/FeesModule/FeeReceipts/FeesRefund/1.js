

// import mongoose from 'mongoose';
// import RefundFees from '../../../../models/FeesModule/RefundFees.js';
// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';

// const createRefundRequest = async (req, res) => {
//   try {
//     const schoolId = req.user?.schoolId;
//     if (!schoolId) {
//       return res.status(401).json({
//         hasError: true,
//         message: 'Access denied: You do not have permission to create refund requests.',
//       });
//     }

//     const {
//       academicYear,
//       refundType,
//       registrationNumber,
//       admissionNumber,
//       firstName,
//       lastName,
//       classId,
//       sectionId,
//       paidAmount,
//       concessionAmount,
//       fineAmount,
//       excessAmount,
//       refundAmount,
//       cancelledAmount,
//       paymentMode,
//       chequeNumber,
//       bankName,
//       paymentDate,
//       refundDate,
//       cancelledDate,
//       feeTypeRefunds,
//       installmentName,
//       existancereceiptNumber,
//       status,
//       balance,
//       cancelReason,
//       chequeSpecificReason,
//       additionalComment,
//     } = req.body;

//     const validPaymentModes = ['Cash', 'Cheque', 'Online'];
//     const validStatuses = ['Paid', 'Cancelled', 'Cheque Return', 'Refund'];

//     if (!schoolId || !academicYear || !refundType || !firstName || !lastName || !classId || !paymentMode || !existancereceiptNumber) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Missing required fields: schoolId, academicYear, refundType, firstName, lastName, classId, paymentMode, and existancereceiptNumber are required.',
//       });
//     }

//     if (!validPaymentModes.includes(paymentMode)) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Invalid payment mode. Must be one of: ${validPaymentModes.join(', ')}.`,
//       });
//     }

//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
//       });
//     }


//     if (status === 'Refund') {
//       if (typeof paidAmount !== 'number' || paidAmount <= 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Paid amount must be a positive number when status is Refund.',
//         });
//       }
//       if (typeof refundAmount !== 'number' || refundAmount <= 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Refund amount must be a positive number when status is Refund.',
//         });
//       }
//       if (typeof cancelledAmount !== 'number' || cancelledAmount !== 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cancelled amount must be 0 when status is Refund.',
//         });
//       }
//       if (cancelledDate !== null) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cancelled date must be null when status is Refund.',
//         });
//       }
//     } else if (status === 'Cancelled' || status === 'Cheque Return') {
//       if (typeof cancelledAmount !== 'number' || cancelledAmount <= 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cancelled amount must be a positive number when status is Cancelled or Cheque Return.',
//         });
//       }
//       if (typeof refundAmount !== 'number' || refundAmount !== 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Refund amount must be 0 when status is Cancelled or Cheque Return.',
//         });
//       }
//       if (refundDate !== null) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Refund date must be null when status is Cancelled or Cheque Return.',
//         });
//       }
//       if (!cancelReason) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cancel reason is required for Cancelled or Cheque Return status.',
//         });
//       }
//       if (status === 'Cheque Return' && !chequeSpecificReason) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cheque-specific reason is required for Cheque Return status.',
//         });
//       }
//     }

//     if (paymentMode === 'Cheque' && (!chequeNumber || !bankName)) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Cheque number and bank name are required for Cheque payment mode.',
//       });
//     }

//     if (refundType === 'Registration Fee' && !registrationNumber) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Registration number is required for Registration Fee refund type.',
//       });
//     }

//     if (typeof balance !== 'number') {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Balance must be a number.',
//       });
//     }

//     let processedFeeTypeRefunds = [];
//     if (refundType === 'School Fees') {
//       if (!feeTypeRefunds || !Array.isArray(feeTypeRefunds) || feeTypeRefunds.length === 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'feeTypeRefunds is required for School Fees refund type.',
//         });
//       }

//       const totalFeeTypeRefund = feeTypeRefunds.reduce(
//         (sum, refund) => sum + (refund.refundAmount || 0),
//         0
//       );
//       const totalFeeTypeCancelled = feeTypeRefunds.reduce(
//         (sum, refund) => sum + (refund.cancelledAmount || 0),
//         0
//       );

//       if (status === 'Refund' && refundAmount !== undefined && totalFeeTypeRefund !== refundAmount) {
//         return res.status(400).json({
//           hasError: true,
//           message: `Sum of feeTypeRefunds amounts (${totalFeeTypeRefund}) does not match refundAmount (${refundAmount}).`,
//         });
//       }

//       for (const refund of feeTypeRefunds) {
//         const feeTypeExists = await FeesType.findById(refund.feeType);
//         if (!feeTypeExists) {
//           return res.status(400).json({
//             hasError: true,
//             message: `FeesType not found for ID: ${refund.feeType}.`,
//           });
//         }

//         if (refundType === 'School Fees') {
//           const schoolFee = await SchoolFees.findOne({
//             schoolId,
//             academicYear,
//             studentAdmissionNumber: admissionNumber,
//             'installments.feeItems.feeTypeId': refund.feeType,
//           });

//           if (!schoolFee) {
//             return res.status(400).json({
//               hasError: true,
//               message: `No fee record found for feeType ${refund.feeType}.`,
//             });
//           }

//           let paidAmountForFeeType = 0;
//           let totalRefundedForFeeType = 0;
//           let totalCancelledForFeeType = 0;
//           schoolFee.installments.forEach((installment) => {
//             const feeItem = installment.feeItems.find(
//               (item) => item.feeTypeId.toString() === refund.feeType.toString()
//             );
//             if (feeItem) {
//               paidAmountForFeeType += feeItem.paid || 0;
//             }
//           });

//           const existingFeeTypeRefunds = await RefundFees.find({
//             schoolId,
//             academicYear,
//             refundType,
//             admissionNumber,
//             'feeTypeRefunds.feeType': refund.feeType,
//           });

//           totalRefundedForFeeType = existingFeeTypeRefunds.reduce((sum, r) => {
//             const feeTypeRefund = r.feeTypeRefunds.find(
//               (ftr) => ftr.feeType.toString() === refund.feeType.toString()
//             );
//             return sum + (feeTypeRefund ? feeTypeRefund.refundAmount : 0);
//           }, 0);

//           totalCancelledForFeeType = existingFeeTypeRefunds.reduce((sum, r) => {
//             const feeTypeRefund = r.feeTypeRefunds.find(
//               (ftr) => ftr.feeType.toString() === refund.feeType.toString()
//             );
//             return sum + (feeTypeRefund ? feeTypeRefund.cancelledAmount : 0);
//           }, 0);

//           processedFeeTypeRefunds.push({
//             feeType: refund.feeType,
//             refundAmount: refund.refundAmount || 0,
//             cancelledAmount: refund.cancelledAmount || 0,
//             paidAmount: refund.paidAmount,
//             concessionAmount: refund.concessionAmount || 0,
//             balance: refund.balance,
//           });
//         }
//       }
//     }

//     const existingRefunds = await RefundFees.find({
//       schoolId,
//       academicYear,
//       refundType,
//       ...(refundType === 'Registration Fee'
//         ? { registrationNumber }
//         : { admissionNumber }),
//     });

//     if (paidAmount !== undefined && (refundAmount !== undefined || cancelledAmount !== undefined)) {
//       const totalRefundedAmount = existingRefunds.reduce(
//         (sum, refund) => sum + (refund.refundAmount || 0),
//         0
//       );
//       const totalCancelledAmount = existingRefunds.reduce(
//         (sum, refund) => sum + (refund.cancelledAmount || 0),
//         0
//       );

//     }

//     const refundRequest = new RefundFees({
//       schoolId,
//       academicYear,
//       refundType,
//       registrationNumber: refundType === 'Registration Fee' ? registrationNumber : null,
//       admissionNumber: refundType !== 'Registration Fee' ? admissionNumber : null,
//       firstName,
//       lastName,
//       classId,
//       sectionId: sectionId || null,
//       paidAmount,
//       concessionAmount: concessionAmount || 0,
//       fineAmount: fineAmount || 0,
//       excessAmount: excessAmount || 0,
//       refundAmount: refundAmount || 0,
//       cancelledAmount: cancelledAmount || 0,
//       balance,
//       feeTypeRefunds: refundType === 'School Fees' ? processedFeeTypeRefunds : [],
//       paymentMode,
//       chequeNumber: paymentMode === 'Cheque' ? chequeNumber : null,
//       bankName: paymentMode === 'Cheque' ? bankName : null,
//       paymentDate: paymentDate || null,
//       refundDate: refundDate || null,
//       cancelledDate: cancelledDate || null,
//       installmentName: installmentName || null,
//       existancereceiptNumber,
//       status,
//       cancelReason,
//       chequeSpecificReason,
//       additionalComment,
//     });

//     const savedRefund = await refundRequest.save();
//     console.log("Saved RefundFees:", savedRefund);

//     return res.status(201).json({
//       hasError: false,
//       message: 'Refund request created successfully.',
//       data: savedRefund,
//     });
//   } catch (error) {
//     console.error('Error creating refund request:', error);
//     return res.status(500).json({
//       hasError: true,
//       message: `Server error while creating refund request: ${error.message}`,
//     });
//   }
// };

// export default createRefundRequest;




// import mongoose from 'mongoose';
// import RefundFees from '../../../../models/FeesModule/RefundFees.js';
// import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';

// const createRefundRequest = async (req, res) => {
//   try {
//     const schoolId = req.user?.schoolId;
//     if (!schoolId) {
//       return res.status(401).json({
//         hasError: true,
//         message: 'Access denied: You do not have permission to create refund requests.',
//       });
//     }

//     const {
//       academicYear,
//       refundType,
//       registrationNumber,
//       admissionNumber,
//       firstName,
//       lastName,
//       classId,
//       sectionId,
//       paidAmount,
//       concessionAmount,
//       fineAmount,
//       excessAmount,
//       refundAmount,
//       cancelledAmount,
//       paymentMode,
//       chequeNumber,
//       bankName,
//       paymentDate,
//       refundDate,
//       cancelledDate,
//       feeTypeRefunds,
//       installmentName,
//       existancereceiptNumber,
//       status,
//       balance,
//       cancelReason,
//       chequeSpecificReason,
//       additionalComment,
//       existanceTransactionnumber
//     } = req.body;

//     const validPaymentModes = ['Cash', 'Cheque', 'Online'];
//     const validStatuses = ['Paid', 'Cancelled', 'Cheque Return', 'Refund'];

//     if (!schoolId || !academicYear || !refundType || !firstName || !lastName || !classId || !paymentMode || !existancereceiptNumber) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Missing required fields: schoolId, academicYear, refundType, firstName, lastName, classId, paymentMode, and existancereceiptNumber are required.',
//       });
//     }

//     if (!validPaymentModes.includes(paymentMode)) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Invalid payment mode. Must be one of: ${validPaymentModes.join(', ')}.`,
//       });
//     }

//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
//       });
//     }






















//     if (status === 'Refund') {
//       if (typeof paidAmount !== 'number' || paidAmount <= 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Paid amount must be a positive number when status is Refund.',
//         });
//       }
//       if (typeof refundAmount !== 'number' || refundAmount <= 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Refund amount must be a positive number when status is Refund.',
//         });
//       }
//       if (typeof cancelledAmount !== 'number' || cancelledAmount !== 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cancelled amount must be 0 when status is Refund.',
//         });
//       }
//       if (cancelledDate !== null) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cancelled date must be null when status is Refund.',
//         });
//       }
//     } else if (status === 'Cancelled' || status === 'Cheque Return') {
//       if (typeof cancelledAmount !== 'number' || cancelledAmount <= 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cancelled amount must be a positive number when status is Cancelled or Cheque Return.',
//         });
//       }
//       if (typeof refundAmount !== 'number' || refundAmount !== 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Refund amount must be 0 when status is Cancelled or Cheque Return.',
//         });
//       }
//       if (refundDate !== null) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Refund date must be null when status is Cancelled or Cheque Return.',
//         });
//       }
//       if (!cancelReason) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cancel reason is required for Cancelled or Cheque Return status.',
//         });
//       }
//       if (status === 'Cheque Return' && !chequeSpecificReason) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'Cheque-specific reason is required for Cheque Return status.',
//         });
//       }
//     }

//     if (paymentMode === 'Cheque' && (!chequeNumber || !bankName)) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Cheque number and bank name are required for Cheque payment mode.',
//       });
//     }

//     if (refundType === 'Registration Fee' && !registrationNumber) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Registration number is required for Registration Fee refund type.',
//       });
//     }

//     if (typeof balance !== 'number') {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Balance must be a number.',
//       });
//     }

//     let processedFeeTypeRefunds = [];
//     if (refundType === 'School Fees') {
//       if (!feeTypeRefunds || !Array.isArray(feeTypeRefunds) || feeTypeRefunds.length === 0) {
//         return res.status(400).json({
//           hasError: true,
//           message: 'feeTypeRefunds is required for School Fees refund type.',
//         });
//       }

//       const totalFeeTypeRefund = feeTypeRefunds.reduce(
//         (sum, refund) => sum + (refund.refundAmount || 0),
//         0
//       );
//       const totalFeeTypeCancelled = feeTypeRefunds.reduce(
//         (sum, refund) => sum + (refund.cancelledAmount || 0),
//         0
//       );

//       if (status === 'Refund' && refundAmount !== undefined && totalFeeTypeRefund !== refundAmount) {
//         return res.status(400).json({
//           hasError: true,
//           message: `Sum of feeTypeRefunds amounts (${totalFeeTypeRefund}) does not match refundAmount (${refundAmount}).`,
//         });
//       }







//       for (const refund of feeTypeRefunds) {
//         const feeTypeExists = await FeesType.findById(refund.feeType);
//         if (!feeTypeExists) {
//           return res.status(400).json({
//             hasError: true,
//             message: `FeesType not found for ID: ${refund.feeType}.`,
//           });
//         }

//         if (refundType === 'School Fees') {
//           const schoolFee = await SchoolFees.findOne({
//             schoolId,
//             academicYear,
//             studentAdmissionNumber: admissionNumber,
//             'installments.feeItems.feeTypeId': refund.feeType,
//           });

//           if (!schoolFee) {
//             return res.status(400).json({
//               hasError: true,
//               message: `No fee record found for feeType ${refund.feeType}.`,
//             });
//           }

//           let paidAmountForFeeType = 0;
//           let totalRefundedForFeeType = 0;
//           let totalCancelledForFeeType = 0;
//           schoolFee.installments.forEach((installment) => {
//             const feeItem = installment.feeItems.find(
//               (item) => item.feeTypeId.toString() === refund.feeType.toString()
//             );
//             if (feeItem) {
//               paidAmountForFeeType += feeItem.paid || 0;
//             }
//           });

//           const existingFeeTypeRefunds = await RefundFees.find({
//             schoolId,
//             academicYear,
//             refundType,
//             admissionNumber,
//             'feeTypeRefunds.feeType': refund.feeType,
//           });

//           totalRefundedForFeeType = existingFeeTypeRefunds.reduce((sum, r) => {
//             const feeTypeRefund = r.feeTypeRefunds.find(
//               (ftr) => ftr.feeType.toString() === refund.feeType.toString()
//             );
//             return sum + (feeTypeRefund ? feeTypeRefund.refundAmount : 0);
//           }, 0);

//           totalCancelledForFeeType = existingFeeTypeRefunds.reduce((sum, r) => {
//             const feeTypeRefund = r.feeTypeRefunds.find(
//               (ftr) => ftr.feeType.toString() === refund.feeType.toString()
//             );
//             return sum + (feeTypeRefund ? feeTypeRefund.cancelledAmount : 0);
//           }, 0);

//           processedFeeTypeRefunds.push({
//             feeType: refund.feeType,
//             refundAmount: refund.refundAmount || 0,
//             cancelledAmount: refund.cancelledAmount || 0,
//             paidAmount: refund.paidAmount,
//             concessionAmount: refund.concessionAmount || 0,
//             balance: refund.balance,
//           });
//         }
//       }
//     }

//     const existingRefunds = await RefundFees.find({
//       schoolId,
//       academicYear,
//       refundType,
//       ...(refundType === 'Registration Fee'
//         ? { registrationNumber }
//         : { admissionNumber }),
//     });

//     if (paidAmount !== undefined && (refundAmount !== undefined || cancelledAmount !== undefined)) {
//       const totalRefundedAmount = existingRefunds.reduce(
//         (sum, refund) => sum + (refund.refundAmount || 0),
//         0
//       );
//       const totalCancelledAmount = existingRefunds.reduce(
//         (sum, refund) => sum + (refund.cancelledAmount || 0),
//         0
//       );

//       const remainingBalance = paidAmount - totalRefundedAmount - totalCancelledAmount - concessionAmount + fineAmount - excessAmount;






//     }

//     console.log("Creating RefundFees with values:", {
//       schoolId,
//       academicYear,
//       refundType,
//       paidAmount,
//       concessionAmount,
//       fineAmount,
//       excessAmount,
//       refundAmount,
//       cancelledAmount,
//       balance,
//       feeTypeRefunds: processedFeeTypeRefunds,
//       registrationNumber,
//     });

//     const refundRequest = new RefundFees({
//       schoolId,
//       academicYear,
//       refundType,
//       registrationNumber: refundType === 'Registration Fee' ? registrationNumber : null,
//       admissionNumber: refundType !== 'Registration Fee' ? admissionNumber : null,
//       firstName,
//       lastName,
//       classId,
//       sectionId: sectionId || null,
//       paidAmount,
//       concessionAmount: concessionAmount || 0,
//       fineAmount: fineAmount || 0,
//       excessAmount: excessAmount || 0,
//       refundAmount: refundAmount || 0,
//       cancelledAmount: cancelledAmount || 0,
//       balance,
//       feeTypeRefunds: refundType === 'School Fees' ? processedFeeTypeRefunds : [],
//       paymentMode,
//       chequeNumber: paymentMode === 'Cheque' ? chequeNumber : null,
//       bankName: paymentMode === 'Cheque' ? bankName : null,
//       paymentDate: paymentDate || null,
//       refundDate: refundDate || null,
//       cancelledDate: cancelledDate || null,
//       installmentName: installmentName || null,
//       existancereceiptNumber,
//       status,
//       cancelReason,
//       chequeSpecificReason,
//       additionalComment,
//        existanceTransactionnumber
//     });

//     const savedRefund = await refundRequest.save();
//     console.log("Saved RefundFees:", savedRefund);

//     return res.status(201).json({
//       hasError: false,
//       message: 'Refund request created successfully.',
//       data: savedRefund,
//     });
//   } catch (error) {
//     console.error('Error creating refund request:', error);
//     return res.status(500).json({
//       hasError: true,
//       message: `Server error while creating refund request: ${error.message}`,
//     });
//   }
// };

// export default createRefundRequest;


// controllers/FeesModule/createRefundRequest.js

import mongoose from 'mongoose';
import RefundFees from '../../../../models/FeesModule/RefundFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import crypto from 'crypto';
import fetch from 'node-fetch';


const EASEBUZZ_KEY = process.env.EASEBUZZ_KEY;
const EASEBUZZ_SALT = process.env.EASEBUZZ_SALT;

const EASEBUZZ_REFUND_URL =
  process.env.EASEBUZZ_ENV === 'prod'
    ? 'https://dashboard.easebuzz.in/transaction/v2/refund'
    : 'https://testdashboard.easebuzz.in/transaction/v2/refund';

// const generateRefundHash = ({ key, txnid, amount, refund_amount, email, phone }) => {
//   const amount_str = parseFloat(amount);
//   const refund_amount_str = parseFloat(refund_amount);

//   const str = `${key}|${txnid}|${amount_str}|${refund_amount_str}|${email}|${phone}|${EASEBUZZ_SALT}`;
//   console.log("Refund Hash String:", str);

//   return crypto.createHash("sha512").update(str).digest("hex");
// };


const generateRefundHash = ({  key,merchant_refund_id,easebuzz_id,refund_amount, }) => {
  // const amount_str = parseFloat(amount);
  const refund_amount_str = parseFloat(refund_amount);

  const str = `${key}|${merchant_refund_id}|${easebuzz_id}|${refund_amount_str}|${EASEBUZZ_SALT}`;
  console.log("Refund Hash String:", str);

  return crypto.createHash("sha512").update(str).digest("hex");
};



const createRefundRequest = async (req, res) => {
  try {

    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ hasError: true, message: 'Unauthorized' });


    const {
      academicYear, refundType, registrationNumber, admissionNumber,
      firstName, lastName, classId, sectionId, paidAmount, concessionAmount,
      fineAmount, excessAmount, refundAmount, cancelledAmount, paymentMode,
      chequeNumber, bankName, paymentDate, refundDate, cancelledDate,
      feeTypeRefunds, installmentName, existancereceiptNumber, status,
      balance, cancelReason, chequeSpecificReason, additionalComment,
      onlineRefundPayload, existanceTransactionnumber
    } = req.body;


    const required = [schoolId, academicYear, refundType, firstName, lastName, classId, paymentMode, existancereceiptNumber];
    if (required.some(f => !f)) {
      return res.status(400).json({ hasError: true, message: 'Missing required fields' });
    }
    if (!['Cash', 'Cheque', 'Online'].includes(paymentMode)) {
      return res.status(400).json({ hasError: true, message: 'Invalid paymentMode' });
    }
    if (!['Cancelled', 'Cheque Return', 'Refund'].includes(status)) {
      return res.status(400).json({ hasError: true, message: 'Invalid status' });
    }


    let finalRefundTxn = null;
    let onlineDetail = null;

    if (paymentMode === 'Online' && status === 'Refund') {

      if (!onlineRefundPayload || typeof onlineRefundPayload !== 'object') {
        return res.status(400).json({ hasError: true, message: 'onlineRefundPayload required' });
      }

    // const { key, txnid, refund_amount, phone, email, amount } = onlineRefundPayload;

      // if (![key, txnid, refund_amount, phone, email, amount].every(Boolean)) {
      //   return res.status(400).json({ hasError: true, message: 'Incomplete Easebuzz payload' });
      // }
      // if (key !== EASEBUZZ_KEY) {
      //   return res.status(400).json({ hasError: true, message: 'Invalid Easebuzz key' });
      // }
      // if (parseFloat(refund_amount) !== parseFloat(refundAmount)) {
      //   return res.status(400).json({ hasError: true, message: 'refund_amount ≠ refundAmount' });
      // }

          const { key, easebuzz_id, refund_amount } = onlineRefundPayload;


      finalRefundTxn = `REF-${easebuzz_id}-${Date.now()}`;


//  const refundReqBody = {
//   key: EASEBUZZ_KEY,
//   txnid,
//   amount,
//   refund_amount,
//   // refund_txnid: finalRefundTxn, 
//   phone,
//   email,
//   hash: generateRefundHash({
//     key: EASEBUZZ_KEY,
//     txnid,
//     amount,
//     refund_amount,
//     email,
//     phone,
//   }),
// };


 const refundReqBody = {
  key: EASEBUZZ_KEY,
  merchant_refund_id:finalRefundTxn,
  easebuzz_id,
  refund_amount,
  hash: generateRefundHash({
    key: EASEBUZZ_KEY,
    merchant_refund_id:finalRefundTxn,
    easebuzz_id,
    refund_amount,
  }),
};


      console.log('Sending Refund → Easebuzz', { url: EASEBUZZ_REFUND_URL, env: process.env.EAZEBUZZ_ENV, body: refundReqBody });

      const apiRes = await fetch(EASEBUZZ_REFUND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundReqBody)
      });

      const easebuzzResult = await apiRes.json();
      console.log('Easebuzz Refund Response →', easebuzzResult);


      if (easebuzzResult.status !== true && easebuzzResult.status !== 1 && easebuzzResult.status !== 'success') {
        return res.status(400).json({
          hasError: true,
          message: 'Easebuzz rejected refund',
          easebuzz_error: easebuzzResult
        });
      }


  //     onlineDetail = {
  //       provider: 'Easebuzz',
  //       txnid,
  //       refund_amount: parseFloat(refund_amount),
  //       email,
  //       phone,
  //       original_amount: parseFloat(amount),
  //      hash: generateRefundHash({
  //   key: EASEBUZZ_KEY,
  //   txnid,
  //   amount,
  //   refund_amount,
  //   email,
  //   phone,
  // }),

  onlineDetail = {
        provider: 'Easebuzz',
      merchant_refund_id:finalRefundTxn,
  easebuzz_id,
  refund_amount,
  hash: generateRefundHash({
    key: EASEBUZZ_KEY,
    merchant_refund_id:finalRefundTxn,
    easebuzz_id,
    refund_amount,
  }),

   
        easebuzzResponse: easebuzzResult,
        createdAt: new Date()
      };
    }


    let processedFeeTypeRefunds = [];

    if (refundType === 'School Fees') {
      if (!Array.isArray(feeTypeRefunds) || feeTypeRefunds.length === 0) {
        return res.status(400).json({ hasError: true, message: 'feeTypeRefunds required required for School Fees' });
      }

      const schoolFeeRecord = await SchoolFees.findOne({
        schoolId,
        receiptNumber: existancereceiptNumber
      });

      if (!schoolFeeRecord) {
        return res.status(400).json({
          hasError: true,
          message: `No School Fees payment found with receipt ${existancereceiptNumber}`
        });
      }

      for (const r of feeTypeRefunds) {
        const feeTypeExists = await FeesType.findById(r.feeType);
        if (!feeTypeExists) {
          return res.status(400).json({ hasError: true, message: `Invalid feeType ID: ${r.feeType}` });
        }

        const totalPaid = schoolFeeRecord.installments.reduce((sum, inst) => {
          const item = inst.feeItems.find(i => i.feeTypeId.toString() === r.feeType);
          return sum + (item?.paid || 0);
        }, 0);

        const alreadyRefunded = await RefundFees.aggregate([
          { $match: { schoolId, existancereceiptNumber, refundType: 'School Fees', 'feeTypeRefunds.feeType': new mongoose.Types.ObjectId(r.feeType) } },
          { $unwind: '$feeTypeRefunds' },
          { $match: { 'feeTypeRefunds.feeType':new  mongoose.Types.ObjectId(r.feeType) } },
          { $group: { _id: null, total: { $sum: { $add: ['$feeTypeRefunds.refundAmount', '$feeTypeRefunds.cancelledAmount'] } } } }
        ]);

        const prev = alreadyRefunded[0]?.total || 0;
        const requested = (r.refundAmount || 0) + (r.cancelledAmount || 0);
        if (prev + requested > totalPaid) {
          return res.status(400).json({
            hasError: true,
            message: `Cannot refund/cancel more than paid (${totalPaid}) for fee type ${r.feeType}`
          });
        }
      }

      const totalRequested = feeTypeRefunds.reduce((s, r) => s + (r.refundAmount || 0) + (r.cancelledAmount || 0), 0);
      const expected = (status === 'Refund' ? refundAmount : 0) + (['Cancelled', 'Cheque Return'].includes(status) ? cancelledAmount : 0);
      if (totalRequested !== expected) {
        return res.status(400).json({
          hasError: true,
          message: `feeTypeRefunds sum (${totalRequested}) ≠ expected (${expected})`
        });
      }

      processedFeeTypeRefunds = feeTypeRefunds.map(r => ({
        feeType: r.feeType,
        paidAmount: r.paidAmount,
        concessionAmount: r.concessionAmount || 0,
        refundAmount: r.refundAmount || 0,
        cancelledAmount: r.cancelledAmount || 0,
        balance: r.balance
      }));
    }


    const refundDoc = new RefundFees({
      schoolId,
      academicYear,
      refundType,
      registrationNumber: refundType === 'Registration Fee' ? registrationNumber : null,
      admissionNumber: refundType !== 'Registration Fee' ? admissionNumber : null,
      firstName,
      lastName,
      classId,
      sectionId: sectionId || null,
      paidAmount,
      concessionAmount: concessionAmount || 0,
      fineAmount: fineAmount || 0,
      excessAmount: excessAmount || 0,
      refundAmount: refundAmount || 0,
      cancelledAmount: cancelledAmount || 0,
      balance,
      feeTypeRefunds: processedFeeTypeRefunds,
      paymentMode,
      chequeNumber: paymentMode === 'Cheque' ? chequeNumber : null,
      bankName: paymentMode === 'Cheque' ? bankName : null,
      paymentDate: paymentDate || null,
      refundDate: refundDate || null,
      cancelledDate: cancelledDate || null,
      installmentName: installmentName || null,
      existancereceiptNumber,
      status,
      cancelReason,
      chequeSpecificReason,
      additionalComment,
      transactionNumber: finalRefundTxn,
      existanceTransactionnumber: existanceTransactionnumber,
      onlineRefundDetails: onlineDetail ? [onlineDetail] : []
    });

    const saved = await refundDoc.save();


    return res.status(201).json({
      hasError: false,
      message: 'Refund created successfully',
      data: {
        ...saved.toObject(),
        generatedReceiptNumber: saved.receiptNumber,
        dashboard_link:
          process.env.EAZEBUZZ_ENV === 'prod'
            ? 'https://dashboard.easebuzz.in'
            : 'https://testdashboard.easebuzz.in'
      }
    });
  } catch (err) {
    console.error('Refund creation error:', err);
    return res.status(500).json({
      hasError: true,
      message: err.message || 'Server error'
    });
  }
};

export default createRefundRequest;