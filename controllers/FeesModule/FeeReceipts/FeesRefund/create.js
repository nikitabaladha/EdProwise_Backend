


import mongoose from 'mongoose';
import RefundFees from '../../../../models/FeesModule/RefundFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import EaseBuzzData from '../../../../models/EasebuzzData.js';
import crypto from 'crypto';
import fetch from 'node-fetch';



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

const generateRefundHash = ({ key, merchant_refund_id, easebuzz_id, refund_amount }, salt) => {
  const refund_amount_str = parseFloat(refund_amount).toFixed(2);
  const str = `${key}|${merchant_refund_id}|${easebuzz_id}|${refund_amount_str}|${salt}`;
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
        return res.status(400).json({ hasError: true, message: 'onlineRefundPayload required for online refund' });
      }

      const { easebuzz_id, refund_amount } = onlineRefundPayload;
      if (!easebuzz_id || !refund_amount || refund_amount <= 0) {
        return res.status(400).json({ hasError: true, message: 'Invalid easebuzz_id or refund_amount' });
      }

      finalRefundTxn = `REF-${easebuzz_id}-${Date.now()}`;


      let credentials;
      try {
        credentials = await getEasebuzzCredentials(schoolId);
      } catch (err) {
        return res.status(400).json({ hasError: true, message: err.message });
      }

      const refundReqBody = {
        key: credentials.key,
        merchant_refund_id: finalRefundTxn,
        easebuzz_id,
        refund_amount: parseFloat(refund_amount).toFixed(2),
        hash: generateRefundHash({
          key: credentials.key,
          merchant_refund_id: finalRefundTxn,
          easebuzz_id,
          refund_amount,
        }, credentials.salt),
      };

      const EASEBUZZ_REFUND_URL = process.env.EASEBUZZ_ENV === 'prod'
        ? 'https://dashboard.easebuzz.in/transaction/v2/refund'
        : 'https://testdashboard.easebuzz.in/transaction/v2/refund';

      console.log('Sending Refund → Easebuzz', { url: EASEBUZZ_REFUND_URL, body: refundReqBody });

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

      onlineDetail = {
        provider: 'Easebuzz',
        merchant_refund_id: finalRefundTxn,
        easebuzz_id,
        refund_amount: parseFloat(refund_amount).toFixed(2),
        hash: refundReqBody.hash,
        easebuzzResponse: easebuzzResult,
        createdAt: new Date()
      };
    }


    let processedFeeTypeRefunds = [];

    if (refundType === 'School Fees') {
      if (!Array.isArray(feeTypeRefunds) || feeTypeRefunds.length === 0) {
        return res.status(400).json({ hasError: true, message: 'feeTypeRefunds required for School Fees' });
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
          { $match: { schoolId, existancereceiptNumber, refundType: 'School Fees', 'feeTypeRefunds.feeType':new mongoose.Types.ObjectId(r.feeType) } },
          { $unwind: '$feeTypeRefunds' },
          { $match: { 'feeTypeRefunds.feeType':new mongoose.Types.ObjectId(r.feeType) } },
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
          process.env.EASEBUZZ_ENV === 'prod'
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


