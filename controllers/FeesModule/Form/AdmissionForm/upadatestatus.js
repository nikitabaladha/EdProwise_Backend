import mongoose from 'mongoose';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';

const updateAdmissionStatus = async (req, res) => {
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
      message: 'Invalid or missing status. Must be one of: Pending, Paid, Cancelled,Cheque Return.',
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
    const admission = await AdmissionForm.findOne({ _id: id, schoolId }).session(session);
    if (!admission) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: 'Admission form not found or you do not have permission to update this record.',
      });
    }

    if (['Cancelled', 'Cheque Return'].includes(admission.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: `Admission is already ${admission.status.toLowerCase()}.`,
      });
    }

    if (admission.paymentMode === 'Cheque' && ['Cancelled', 'Cheque Return'].includes(status) && !chequeSpecificReason) {
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
      if (admission.paymentMode === 'Cheque') {
        updateFields.chequeSpecificReason = chequeSpecificReason;
      }
    }

    const updatedAdmission = await AdmissionForm.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateFields },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      hasError: false,
      message: `Admission status updated to ${status} successfully.`,
      admission: updatedAdmission,
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

export default updateAdmissionStatus;