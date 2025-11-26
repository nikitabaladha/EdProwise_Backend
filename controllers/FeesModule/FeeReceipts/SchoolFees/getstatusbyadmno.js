import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";

const getSchoolFeesStatusByIdentifiers = async (req, res) => {
  const { schoolId, studentAdmissionNumber, receiptNumber } = req.params;

  if (!schoolId || !studentAdmissionNumber || !receiptNumber) {
    return res.status(400).json({
      hasError: true,
      message: "School ID, student admission number, and receipt number are required.",
    });
  }

  try {
    const feeRecord = await SchoolFees.findOne({
      schoolId,
      studentAdmissionNumber,
      receiptNumber
    }).select(
      "status cancelReason chequeSpecificReason additionalComment cancelledDate paymentMode"
    );

    if (!feeRecord) {
      return res.status(404).json({
        hasError: true,
        message: "School fee record not found for the provided identifiers.",
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

export default getSchoolFeesStatusByIdentifiers;