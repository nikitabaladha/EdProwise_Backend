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
      refundAmount,
      paymentMode,
      chequeNumber,
      bankName,
      paymentDate,
      feeTypeRefunds,
    } = req.body;

    const validRefundTypes = ['Registration Fees', 'Admission Fees', 'School Fees', 'Board Registration Fees', 'Board Exam Fees'];
    const validPaymentModes = ['Cash', 'Cheque', 'Online'];

 
    if (!schoolId || !academicYear || !refundType || !firstName || !lastName || !classId || !refundAmount || !paymentMode) {
      return res.status(400).json({
        hasError: true,
        message: 'Missing required fields: schoolId, academicYear, refundType, firstName, lastName, classId, refundAmount, and paymentMode are required.',
      });
    }

    if (!validRefundTypes.includes(refundType)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid refund type. Must be one of: ${validRefundTypes.join(', ')}.`,
      });
    }

    if (!validPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid payment mode. Must be one of: ${validPaymentModes.join(', ')}.`,
      });
    }

    if (paymentMode === 'Cheque' && (!chequeNumber || !bankName)) {
      return res.status(400).json({
        hasError: true,
        message: 'Cheque number and bank name are required for Cheque payment mode.',
      });
    }

    if (typeof refundAmount !== 'number' || refundAmount <= 0) {
      return res.status(400).json({
        hasError: true,
        message: 'Refund amount must be a positive number.',
      });
    }

    if (typeof paidAmount !== 'number' || paidAmount < 0) {
      return res.status(400).json({
        hasError: true,
        message: 'Paid amount must be a non-negative number.',
      });
    }

    if (refundType === 'Registration Fees' && !registrationNumber) {
      return res.status(400).json({
        hasError: true,
        message: 'Registration number is required for Registration Fees refund type.',
      });
    }

    if (refundType !== 'Registration Fees' && !admissionNumber) {
      return res.status(400).json({
        hasError: true,
        message: 'Admission number is required for non-Registration Fees refund types.',
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
      if (totalFeeTypeRefund !== refundAmount) {
        return res.status(400).json({
          hasError: true,
          message: `Sum of feeTypeRefunds amounts (${totalFeeTypeRefund}) does not match refundAmount (${refundAmount}).`,
        });
      }

      for (const refund of feeTypeRefunds) {
        if (!mongoose.Types.ObjectId.isValid(refund.feetype)) {
          return res.status(400).json({
            hasError: true,
            message: `Invalid feeType ID: ${refund.feetype}.`,
          });
        }

        const feeTypeExists = await FeesType.findById(refund.feetype);
        if (!feeTypeExists) {
          return res.status(400).json({
            hasError: true,
            message: `FeesType not found for ID: ${refund.feetype}.`,
          });
        }

        const schoolFee = await SchoolFees.findOne({
          schoolId,
          academicYear,
          studentAdmissionNumber: admissionNumber,
          'installments.feeItems.feeTypeId': refund.feetype,
        });

        if (!schoolFee) {
          return res.status(400).json({
            hasError: true,
            message: `No fee record found for feeType ${refund.feetype}.`,
          });
        }

        let paidAmountForFeeType = 0;
        let totalRefundedForFeeType = 0;
        schoolFee.installments.forEach((installment) => {
          const feeItem = installment.feeItems.find(
            (item) => item.feeTypeId.toString() === refund.feetype.toString()
          );
          if (feeItem) {
            paidAmountForFeeType += feeItem.paidAmount || 0;
          }
        });

 
        const existingFeeTypeRefunds = await RefundFees.find({
          schoolId,
          academicYear,
          refundType,
          admissionNumber,
          'feeTypeRefunds.feetype': refund.feetype,
        });

        totalRefundedForFeeType = existingFeeTypeRefunds.reduce((sum, r) => {
          const feeTypeRefund = r.feeTypeRefunds.find(
            (ftr) => ftr.feetype.toString() === refund.feetype.toString()
          );
          return sum + (feeTypeRefund ? feeTypeRefund.refundAmount : 0);
        }, 0);
        processedFeeTypeRefunds.push({
          feetype: refund.feetype,
          refundAmount: refund.refundAmount,
          paidAmount: refund.paidAmount,
          balance:refund.balance ,
        });
      }
    }


    const existingRefunds = await RefundFees.find({
      schoolId,
      academicYear,
      refundType,
      ...(refundType === 'Registration Fees'
        ? { registrationNumber }
        : { admissionNumber }),
    });

    const totalRefundedAmount = existingRefunds.reduce(
      (sum, refund) => sum + (refund.refundAmount || 0),
      0
    );

    const remainingBalance = paidAmount - totalRefundedAmount;
    if (remainingBalance <= 0) {
      return res.status(400).json({
        hasError: true,
        message: 'No balance remaining for this refund type and student.',
      });
    }

    if (refundAmount > remainingBalance) {
      return res.status(400).json({
        hasError: true,
        message: `Refund amount (${refundAmount}) exceeds remaining balance (${remainingBalance}).`,
      });
    }

    const refundRequest = new RefundFees({
      schoolId,
      academicYear,
      refundType,
      registrationNumber: refundType === 'Registration Fees' ? registrationNumber : null,
      admissionNumber: refundType !== 'Registration Fees' ? admissionNumber : null,
      firstName,
      lastName,
      classId,
      sectionId: sectionId || null,
      paidAmount,
      refundAmount,
      feeTypeRefunds: refundType === 'School Fees' ? processedFeeTypeRefunds : [],
      paymentMode,
      chequeNumber: paymentMode === 'Cheque' ? chequeNumber : null,
      bankName: paymentMode === 'Cheque' ? bankName : null,
      paymentDate: paymentDate || null,
    });

    const savedRefund = await refundRequest.save();

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