import mongoose from 'mongoose';
import StudentTC from '../../../../models/FeesModule/TCForm.js';

const updateTCStatus = async (req, res) => {
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
    const tcRecord = await StudentTC.findOne({ _id: id, schoolId }).session(session);
    if (!tcRecord) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: 'TC record not found or you do not have permission to update this record.',
      });
    }

    if (['Cancelled', 'Cheque Return'].includes(tcRecord.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: `TC is already ${tcRecord.status.toLowerCase()}.`,
      });
    }

    if (
      tcRecord.paymentMode === 'Cheque' &&
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

    const updateFields = { status };
    if (['Cancelled', 'Cheque Return'].includes(status)) {
      updateFields.cancelledDate = new Date();
      updateFields.cancelReason = cancelReason;
      updateFields.additionalComment = additionalComment;
      if (tcRecord.paymentMode === 'Cheque') {
        updateFields.chequeSpecificReason = chequeSpecificReason;
      }
    }

    const updatedTC = await StudentTC.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateFields },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      hasError: false,
      message: `TC status updated to ${status} successfully.`,
      tc: updatedTC,
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

export default updateTCStatus;
