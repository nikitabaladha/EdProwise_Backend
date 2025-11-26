
import mongoose from 'mongoose';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';

const updateRegistrationStatus = async (req, res) => {
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
    const student = await StudentRegistration.findOne({ _id: id, schoolId }).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: 'Student not found or you do not have permission to update this record.',
      });
    }


    if (['Cancelled', 'Cheque Return'].includes(student.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: `Receipt is already ${student.status.toLowerCase()}.`,
      });
    }


    if (student.paymentMode === 'Cheque' && ['Cancelled', 'Cheque Return'].includes(status) && !chequeSpecificReason) {
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
      if (student.paymentMode === 'Cheque') {
        updateFields.chequeSpecificReason = chequeSpecificReason;
      }
    }

    const updatedStudent = await StudentRegistration.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateFields },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      hasError: false,
      message: `Student registration status updated to ${status} successfully.`,
      student: updatedStudent,
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

export default updateRegistrationStatus;