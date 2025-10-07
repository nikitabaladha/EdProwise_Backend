import RefundFees from '../../../../models/FeesModule/RefundFees.js';

const getRefundByReceiptNumber = async (req, res) => {
  try {
    let { schoolId, existancereceiptNumber } = req.params;
    const userSchoolId = req.user?.schoolId;

    if (!userSchoolId) {
      return res.status(401).json({
        hasError: true,
        message: 'Access denied: You do not have permission to access refund details.',
      });
    }

    if (!schoolId || !existancereceiptNumber) {
      return res.status(400).json({
        hasError: true,
        message: 'Missing required fields: schoolId and existancereceiptNumber are required in URL parameters.',
      });
    }

    if (schoolId !== userSchoolId) {
      return res.status(403).json({
        hasError: true,
        message: 'Access denied: You do not have permission to access refund details for this school.',
      });
    }

    const refundDetails = await RefundFees.aggregate([
      {
        $match: {
          schoolId,
          existancereceiptNumber,
        },
      },
      {
        $group: {
          _id: { schoolId: "$schoolId", existancereceiptNumber: "$existancereceiptNumber" },
          totalRefundAmount: { $sum: "$refundAmount" },
          refunds: { $push: "$$ROOT" }, 
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'refunds.classId',
          foreignField: '_id',
          as: 'classDetails',
        },
      },
    ]);

    if (!refundDetails || refundDetails.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No refund found for receipt number ${existancereceiptNumber} and schoolId ${schoolId}.`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: 'Refund details retrieved successfully.',
      data: {
        totalRefundAmount: refundDetails[0].totalRefundAmount,
        refunds: refundDetails[0].refunds,
        classDetails: refundDetails[0].classDetails,
      },
    });
  } catch (error) {
    console.error('Error retrieving refund details:', error);
    return res.status(500).json({
      hasError: true,
      message: `Server error while retrieving refund details: ${error.message}`,
    });
  }
};

export default getRefundByReceiptNumber;