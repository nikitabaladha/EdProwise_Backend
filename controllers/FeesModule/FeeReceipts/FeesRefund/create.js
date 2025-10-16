
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

//     // Update refundType to match the payload
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
//       if ((status === 'Cancelled' || status === 'Cheque Return') && cancelledAmount !== undefined && totalFeeTypeCancelled !== cancelledAmount) {
//         return res.status(400).json({
//           hasError: true,
//           message: `Sum of feeTypeRefunds cancelled amounts (${totalFeeTypeCancelled}) does not match cancelledAmount (${cancelledAmount}).`,
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
//             return sum + (feeTypeRefund ?feeTypeRefund.cancelledAmount : 0);
//           }, 0);

//           processedFeeTypeRefunds.push({
//             feeType: refund.feeType,
//             refundAmount: refund.refundAmount || 0,
//             cancelledAmount: refund.cancelledAmount || 0,
//             paidAmount: refund.paidAmount,
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

//       const remainingBalance = paidAmount - totalRefundedAmount - totalCancelledAmount;
//     }

//     console.log("Creating RefundFees with values:", {
//       schoolId,
//       academicYear,
//       refundType,
//       paidAmount,
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
//       registrationNumber: refundType === 'Registration Fee' ? registrationNumber : null, // Updated here
//       admissionNumber: refundType !== 'Registration Fee' ? admissionNumber : null,
//       firstName,
//       lastName,
//       classId,
//       sectionId: sectionId || null,
//       paidAmount,
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

import mongoose from 'mongoose';
import RefundFees from '../../../../models/FeesModule/RefundFees.js';
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';

const createRefundRequest = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: 'Access denied: You do not have permission to create refund requests.',
      });
    }

    const {
      academicYear,
      refundType,
      registrationNumber,
      admissionNumber,
      firstName,
      lastName,
      classId,
      sectionId,
      paidAmount,
      concessionAmount,
      fineAmount,
      excessAmount,
      refundAmount,
      cancelledAmount,
      paymentMode,
      chequeNumber,
      bankName,
      paymentDate,
      refundDate,
      cancelledDate,
      feeTypeRefunds,
      installmentName,
      existancereceiptNumber,
      status,
      balance,
      cancelReason,
      chequeSpecificReason,
      additionalComment,
    } = req.body;

    const validPaymentModes = ['Cash', 'Cheque', 'Online'];
    const validStatuses = ['Paid', 'Cancelled', 'Cheque Return', 'Refund'];

    if (!schoolId || !academicYear || !refundType || !firstName || !lastName || !classId || !paymentMode || !existancereceiptNumber) {
      return res.status(400).json({
        hasError: true,
        message: 'Missing required fields: schoolId, academicYear, refundType, firstName, lastName, classId, paymentMode, and existancereceiptNumber are required.',
      });
    }

    if (!validPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid payment mode. Must be one of: ${validPaymentModes.join(', ')}.`,
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    // if (typeof concessionAmount !== 'number' || concessionAmount < 0) {
    //   return res.status(400).json({
    //     hasError: true,
    //     message: 'Concession amount must be a non-negative number.',
    //   });
    // }

    // if (typeof fineAmount !== 'number' || fineAmount < 0) {
    //   return res.status(400).json({
    //     hasError: true,
    //     message: 'Fine amount must be a non-negative number.',
    //   });
    // }

    // if (typeof excessAmount !== 'number' || excessAmount < 0) {
    //   return res.status(400).json({
    //     hasError: true,
    //     message: 'Excess amount must be a non-negative number.',
    //   });
    // }

    if (status === 'Refund') {
      if (typeof paidAmount !== 'number' || paidAmount <= 0) {
        return res.status(400).json({
          hasError: true,
          message: 'Paid amount must be a positive number when status is Refund.',
        });
      }
      if (typeof refundAmount !== 'number' || refundAmount <= 0) {
        return res.status(400).json({
          hasError: true,
          message: 'Refund amount must be a positive number when status is Refund.',
        });
      }
      if (typeof cancelledAmount !== 'number' || cancelledAmount !== 0) {
        return res.status(400).json({
          hasError: true,
          message: 'Cancelled amount must be 0 when status is Refund.',
        });
      }
      if (cancelledDate !== null) {
        return res.status(400).json({
          hasError: true,
          message: 'Cancelled date must be null when status is Refund.',
        });
      }
    } else if (status === 'Cancelled' || status === 'Cheque Return') {
      if (typeof cancelledAmount !== 'number' || cancelledAmount <= 0) {
        return res.status(400).json({
          hasError: true,
          message: 'Cancelled amount must be a positive number when status is Cancelled or Cheque Return.',
        });
      }
      if (typeof refundAmount !== 'number' || refundAmount !== 0) {
        return res.status(400).json({
          hasError: true,
          message: 'Refund amount must be 0 when status is Cancelled or Cheque Return.',
        });
      }
      if (refundDate !== null) {
        return res.status(400).json({
          hasError: true,
          message: 'Refund date must be null when status is Cancelled or Cheque Return.',
        });
      }
      if (!cancelReason) {
        return res.status(400).json({
          hasError: true,
          message: 'Cancel reason is required for Cancelled or Cheque Return status.',
        });
      }
      if (status === 'Cheque Return' && !chequeSpecificReason) {
        return res.status(400).json({
          hasError: true,
          message: 'Cheque-specific reason is required for Cheque Return status.',
        });
      }
    }

    if (paymentMode === 'Cheque' && (!chequeNumber || !bankName)) {
      return res.status(400).json({
        hasError: true,
        message: 'Cheque number and bank name are required for Cheque payment mode.',
      });
    }

    if (refundType === 'Registration Fee' && !registrationNumber) {
      return res.status(400).json({
        hasError: true,
        message: 'Registration number is required for Registration Fee refund type.',
      });
    }

    if (typeof balance !== 'number') {
      return res.status(400).json({
        hasError: true,
        message: 'Balance must be a number.',
      });
    }

    let processedFeeTypeRefunds = [];
    if (refundType === 'School Fees') {
      if (!feeTypeRefunds || !Array.isArray(feeTypeRefunds) || feeTypeRefunds.length === 0) {
        return res.status(400).json({
          hasError: true,
          message: 'feeTypeRefunds is required for School Fees refund type.',
        });
      }

      const totalFeeTypeRefund = feeTypeRefunds.reduce(
        (sum, refund) => sum + (refund.refundAmount || 0),
        0
      );
      const totalFeeTypeCancelled = feeTypeRefunds.reduce(
        (sum, refund) => sum + (refund.cancelledAmount || 0),
        0
      );

      if (status === 'Refund' && refundAmount !== undefined && totalFeeTypeRefund !== refundAmount) {
        return res.status(400).json({
          hasError: true,
          message: `Sum of feeTypeRefunds amounts (${totalFeeTypeRefund}) does not match refundAmount (${refundAmount}).`,
        });
      }
      // if ((status === 'Cancelled' || status === 'Cheque Return') && cancelledAmount !== undefined && totalFeeTypeCancelled !== cancelledAmount) {
      //   return res.status(400).json({
      //     hasError: true,
      //     message: `Sum of feeTypeRefunds cancelled amounts (${totalFeeTypeCancelled}) does not match cancelledAmount (${cancelledAmount}).`,
      //   });
      // }

      for (const refund of feeTypeRefunds) {
        const feeTypeExists = await FeesType.findById(refund.feeType);
        if (!feeTypeExists) {
          return res.status(400).json({
            hasError: true,
            message: `FeesType not found for ID: ${refund.feeType}.`,
          });
        }

        if (refundType === 'School Fees') {
          const schoolFee = await SchoolFees.findOne({
            schoolId,
            academicYear,
            studentAdmissionNumber: admissionNumber,
            'installments.feeItems.feeTypeId': refund.feeType,
          });

          if (!schoolFee) {
            return res.status(400).json({
              hasError: true,
              message: `No fee record found for feeType ${refund.feeType}.`,
            });
          }

          let paidAmountForFeeType = 0;
          let totalRefundedForFeeType = 0;
          let totalCancelledForFeeType = 0;
          schoolFee.installments.forEach((installment) => {
            const feeItem = installment.feeItems.find(
              (item) => item.feeTypeId.toString() === refund.feeType.toString()
            );
            if (feeItem) {
              paidAmountForFeeType += feeItem.paid || 0;
            }
          });

          const existingFeeTypeRefunds = await RefundFees.find({
            schoolId,
            academicYear,
            refundType,
            admissionNumber,
            'feeTypeRefunds.feeType': refund.feeType,
          });

          totalRefundedForFeeType = existingFeeTypeRefunds.reduce((sum, r) => {
            const feeTypeRefund = r.feeTypeRefunds.find(
              (ftr) => ftr.feeType.toString() === refund.feeType.toString()
            );
            return sum + (feeTypeRefund ? feeTypeRefund.refundAmount : 0);
          }, 0);

          totalCancelledForFeeType = existingFeeTypeRefunds.reduce((sum, r) => {
            const feeTypeRefund = r.feeTypeRefunds.find(
              (ftr) => ftr.feeType.toString() === refund.feeType.toString()
            );
            return sum + (feeTypeRefund ? feeTypeRefund.cancelledAmount : 0);
          }, 0);

          processedFeeTypeRefunds.push({
            feeType: refund.feeType,
            refundAmount: refund.refundAmount || 0,
            cancelledAmount: refund.cancelledAmount || 0,
            paidAmount: refund.paidAmount,
            concessionAmount: refund.concessionAmount || 0,
            balance: refund.balance,
          });
        }
      }
    }

    const existingRefunds = await RefundFees.find({
      schoolId,
      academicYear,
      refundType,
      ...(refundType === 'Registration Fee'
        ? { registrationNumber }
        : { admissionNumber }),
    });

    if (paidAmount !== undefined && (refundAmount !== undefined || cancelledAmount !== undefined)) {
      const totalRefundedAmount = existingRefunds.reduce(
        (sum, refund) => sum + (refund.refundAmount || 0),
        0
      );
      const totalCancelledAmount = existingRefunds.reduce(
        (sum, refund) => sum + (refund.cancelledAmount || 0),
        0
      );

      const remainingBalance = paidAmount - totalRefundedAmount - totalCancelledAmount - concessionAmount + fineAmount - excessAmount;
      if (remainingBalance < 0) {
        return res.status(400).json({
          hasError: true,
          message: 'Remaining balance cannot be negative after accounting for concession, fine, and excess amounts.',
        });
      }
    }

    console.log("Creating RefundFees with values:", {
      schoolId,
      academicYear,
      refundType,
      paidAmount,
      concessionAmount,
      fineAmount,
      excessAmount,
      refundAmount,
      cancelledAmount,
      balance,
      feeTypeRefunds: processedFeeTypeRefunds,
      registrationNumber,
    });

    const refundRequest = new RefundFees({
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
      feeTypeRefunds: refundType === 'School Fees' ? processedFeeTypeRefunds : [],
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
    });

    const savedRefund = await refundRequest.save();
    console.log("Saved RefundFees:", savedRefund);

    return res.status(201).json({
      hasError: false,
      message: 'Refund request created successfully.',
      data: savedRefund,
    });
  } catch (error) {
    console.error('Error creating refund request:', error);
    return res.status(500).json({
      hasError: true,
      message: `Server error while creating refund request: ${error.message}`,
    });
  }
};

export default createRefundRequest;