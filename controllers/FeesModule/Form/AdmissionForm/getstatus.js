import StudentAdmissionfrom from "../../../../models/FeesModule/AdmissionForm.js"

const getAdmissionStatus = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  const { id } = req.params;

  try {
    const student = await StudentAdmissionfrom.findOne({ _id: id, schoolId }).select('status cancelReason chequeSpecificReason additionalComment cancelledDate paymentMode');

    if (!student) {
      return res.status(404).json({
        hasError: true,
        message: 'Student not found or you do not have permission to access this record.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Student admissionstatus retrieved successfully.',
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
      details: 'Error retrieving student admssion status.',
    });
  }
};

export default getAdmissionStatus;