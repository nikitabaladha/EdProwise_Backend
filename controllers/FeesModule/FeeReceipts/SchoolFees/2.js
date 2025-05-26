import mongoose from 'mongoose';
import { SchoolFees, SchoolFeesCounter } from '../../../../models/FeesModule/SchoolFees.js';

const getNextReceiptNumber = async (schoolId, session) => {
  const counter = await SchoolFeesCounter.findOneAndUpdate(
    { schoolId },
    { $inc: { receiptSeq: 1 } },
    { new: true, upsert: true, session }
  );
  return `REC-${counter.receiptSeq.toString().padStart(5, '0')}`;
};

const schoolFees = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      await session.abortTransaction();
      return res.status(401).json({
        hasError: true,
        message: 'Access denied: School ID missing.'
      });
    }

    const {
      studentAdmissionNumber,
      studentName,
      className,
      section,
      transactionNumber,
      paymentMode,
      collectorName,
      academicYear,
      installments,
      chequeNumber,       
      bankName,           
       paymentDate    
    } = req.body;

    if (!Array.isArray(installments) || installments.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        hasError: true,
        message: 'Installments data is required and must be a non-empty array.'
      });
    }

    const existingRecord = await SchoolFees.findOne({
      schoolId,
      studentAdmissionNumber,
      academicYear
    }).session(session);

    const newReceiptNumber = await getNextReceiptNumber(schoolId, session);

    if (existingRecord) {
      existingRecord.receiptNumber = newReceiptNumber;
      existingRecord.transactionNumber = transactionNumber;
      existingRecord.paymentMode = paymentMode;
      existingRecord.collectorName = collectorName;
      existingRecord.paymentDate = paymentDate;
      existingRecord.chequeNumber = chequeNumber;
      existingRecord.bankName = bankName;



      installments.forEach((newInstallment) => {
        const existingInstallment = existingRecord.installments.find(
          (inst) => inst.number === newInstallment.number
        );

        if (existingInstallment) {
          newInstallment.feeItems.forEach((newFeeItem) => {
            const existingFeeItem = existingInstallment.feeItems.find(
              (item) => item.feeTypeId === newFeeItem.feeTypeId
            );

            if (existingFeeItem) {
              existingFeeItem.amount = newFeeItem.amount;
              existingFeeItem.concession = newFeeItem.concession;
              existingFeeItem.fineAmount = newFeeItem.fineAmount;
              existingFeeItem.payable = newFeeItem.payable;
              existingFeeItem.paid = newFeeItem.paid;
              existingFeeItem.balance = newFeeItem.balance;
            } else {
              existingInstallment.feeItems.push(newFeeItem);
            }
          });
        } else {
          existingRecord.installments.push(newInstallment);
        }
      });

      await existingRecord.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        hasError: false,
        message: 'Fee receipt updated with new data and receipt number.',
        receipt: existingRecord
      });
    } else {
      const processedInstallments = installments.map((inst, index) => ({
        ...inst,
        number: inst.number ?? index + 1
      }));

      const newSchoolFees = new SchoolFees({
        schoolId,
        studentAdmissionNumber,
        studentName,
        className,
        section,
        receiptNumber: newReceiptNumber,
        transactionNumber,
        paymentMode,
        collectorName,
        academicYear,
        chequeNumber,       
        bankName,           
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(), 
        installments: processedInstallments
      });

      await newSchoolFees.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        hasError: false,
        message: 'New school fee record created successfully.',
        receipt: newSchoolFees
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error in school fee API:', error);
    return res.status(500).json({
      hasError: true,
      message: 'Internal server error while saving fee receipt.',
      error: error.message
    });
  }
};

export default schoolFees;
