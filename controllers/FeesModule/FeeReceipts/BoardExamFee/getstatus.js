import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';

const getBoardExamFeePaymentStatus = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  const { id } = req.params;

  try {
    const student = await BoardExamFeePayment.findOne({
      admissionId: id,
      schoolId,
    }).select(
      'status cancelReason chequeSpecificReason additionalComment cancelledDate paymentMode'
    );

    if (!student) {
      return res.status(404).json({
        hasError: true,
        message: 'Student not found or you do not have permission to access this record.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Student board exam fee payment status retrieved successfully.',
      student: {
        status: student.status,
        cancelReason: student.cancelReason || null,
        chequeSpecificReason: student.chequeSpecificReason || null,
        additionalComment: student.additionalComment || null,
        cancelledDate: student.cancelledDate || null,
        paymentMode: student.paymentMode || null,
      },
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message,
      details: 'Error retrieving student board exam fee payment status.',
    });
  }
};

export default getBoardExamFeePaymentStatus;
