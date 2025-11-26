import mongoose from 'mongoose';
import BoardregistartionFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';

const updateBoardRegistrationFeePaymentStatus = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  const { id } = req.params;
  const { status, cancelReason, chequeSpecificReason, additionalComment } = req.body;

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
    const paymentRecord = await BoardregistartionFeePayment.findOne({
      $or: [{ _id: id }, { admissionId: id }],
      schoolId
    }).session(session);

    if (!paymentRecord) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: 'Payment record not found or you do not have permission to update this record.',
      });
    }

    if (['Cancelled', 'Cheque Return'].includes(paymentRecord.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: `Payment is already ${paymentRecord.status.toLowerCase()}.`,
      });
    }

    if (
      paymentRecord.paymentMode === 'Cheque' &&
      ['Cancelled', 'Cheque Return'].includes(status) &&
      !chequeSpecificReason
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: 'Cheque-specific reason is required when cancelling or returning a cheque payment.',
      });
    }

    const updateData = { status };
    if (['Cancelled', 'Cheque Return'].includes(status)) {
      updateData.cancelledDate = new Date();
      updateData.cancelReason = cancelReason;
      updateData.additionalComment = additionalComment;
      if (paymentRecord.paymentMode === 'Cheque') {
        updateData.chequeSpecificReason = chequeSpecificReason;
      }
    }

    const updatedPayment = await BoardregistartionFeePayment.findOneAndUpdate(
      { $or: [{ _id: id }, { admissionId: id }], schoolId },
      { $set: updateData },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      hasError: false,
      message: `Board registration fee payment status updated to ${status} successfully.`,
      payment: updatedPayment,
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

export default updateBoardRegistrationFeePaymentStatus;
