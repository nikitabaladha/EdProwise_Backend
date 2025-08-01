import mongoose from 'mongoose';
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';

const updateSchoolFeesStatus = async (req, res) => {
  const { schoolId, studentAdmissionNumber, receiptNumber } = req.params;
  const { status, cancelReason, chequeSpecificReason, additionalComment } = req.body;


  if (!schoolId || !studentAdmissionNumber || !receiptNumber) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID, student admission number, and receipt number are required.',
    });
  }


  if (!status || !['Pending', 'Paid', 'Cancelled', 'Cheque Return'].includes(status)) {
    return res.status(400).json({
      hasError: true,
      message: 'Invalid or missing status. Must be one of: Pending, Paid, Cancelled, Cheque Return.',
    });
  }

  
  if (['Cancelled', 'Cheque Return'].includes(status) && !cancelReason) {
    return res.status(400).json({
      hasError: true,
      message: 'Cancel reason is required when status is Cancelled or Cheque Return.',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fees = await SchoolFees.findOne({ schoolId, studentAdmissionNumber, receiptNumber }).session(session);

    if (!fees) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: 'School fees record not found for the provided identifiers.',
      });
    }

 
    if (['Cancelled', 'Cheque Return'].includes(fees.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: `This fee is already marked as ${fees.status.toLowerCase()}.`,
      });
    }

    
    if (fees.paymentMode === 'Cheque' && ['Cancelled', 'Cheque Return'].includes(status) && !chequeSpecificReason) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: 'Cheque-specific reason is required when cancelling or returning a cheque payment.',
      });
    }

   
    const updateFields = { status };

    if (['Cancelled', 'Cheque Return'].includes(status)) {
      updateFields.cancelledDate = new Date();
      updateFields.cancelReason = cancelReason;
      updateFields.additionalComment = additionalComment || '';
      if (fees.paymentMode === 'Cheque') {
        updateFields.chequeSpecificReason = chequeSpecificReason;
      }
    }


    const updatedSchoolFees = await SchoolFees.findOneAndUpdate(
      { schoolId, studentAdmissionNumber, receiptNumber },
      { $set: updateFields },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      hasError: false,
      message: `School fees status updated to ${status} successfully.`,
      schoolFees: updatedSchoolFees,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      hasError: true,
      message: err.message,
      details: 'Transaction aborted. No changes were saved.',
    });
  }
};

export default updateSchoolFeesStatus;