import RefundFees from '../../../../models/FeesModule/RefundFees.js';

const getRefundRequests = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: 'School ID and academic year are required in params.',
      });
    }


    const refundRequests = await RefundFees.find({ schoolId, academicYear })
      .populate({
        path: 'feeTypeRefunds.feetype',
        select: 'feesTypeName', 
      });

    if (!refundRequests || refundRequests.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No refund requests found for school ID ${schoolId} and academic year ${academicYear}.`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: 'Refund requests fetched successfully.',
      data: refundRequests,
    });
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    return res.status(500).json({
      hasError: true,
      message: `Server error while fetching refund requests: ${error.message}`,
    });
  }
};

export default getRefundRequests;