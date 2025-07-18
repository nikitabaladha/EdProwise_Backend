import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";

const getSchoolFeesStatusByAdmissionNumber = async (req, res) => {
  const { schoolId, studentAdmissionNumber } = req.params;

  if (!schoolId || !studentAdmissionNumber) {
    return res.status(400).json({
      hasError: true,
      message: "School ID and student admission number are required.",
    });
  }

  try {
    const feeRecord = await SchoolFees.findOne({ schoolId, studentAdmissionNumber }).select(
      "status cancelReason chequeSpecificReason additionalComment cancelledDate paymentMode"
    );

    if (!feeRecord) {
      return res.status(404).json({
        hasError: true,
        message: "School fee record not found for this student.",
      });
    }

    res.status(200).json({
      hasError: false,
      message: "School fee status retrieved successfully.",
      schoolFees: {
        status: feeRecord.status,
        cancelReason: feeRecord.cancelReason || null,
        chequeSpecificReason: feeRecord.chequeSpecificReason || null,
        additionalComment: feeRecord.additionalComment || null,
        cancelledDate: feeRecord.cancelledDate || null,
        paymentMode: feeRecord.paymentMode || null,
      },
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message,
      details: "Error retrieving school fee status.",
    });
  }
};

export default getSchoolFeesStatusByAdmissionNumber;
