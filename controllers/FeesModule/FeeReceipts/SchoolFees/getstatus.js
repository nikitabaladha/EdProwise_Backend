import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";

const getSchoolFeesStatus = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: "Access denied: School ID missing.",
    });
  }

  const { id } = req.params;

  try {
    const feeRecord = await SchoolFees.findOne({ _id: id, schoolId }).select(
      "status cancelReason chequeSpecificReason additionalComment cancelledDate paymentMode"
    );

    if (!feeRecord) {
      return res.status(404).json({
        hasError: true,
        message: "School fee record not found or you do not have permission to access this record.",
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

export default getSchoolFeesStatus;
