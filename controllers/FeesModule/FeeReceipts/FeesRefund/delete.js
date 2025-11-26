import RefundFees from '../../../../models/FeesModule/RefundFees.js';

const deleteRefundRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: 'Access denied: You do not have permission to delete refund requests.',
      });
    }

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: 'Refund request ID is required.',
      });
    }

    const refundRequest = await RefundFees.findOne({ _id: id, schoolId });

    if (!refundRequest) {
      return res.status(404).json({
        hasError: true,
        message: `No refund request found with ID ${id} for school ID ${schoolId}.`,
      });
    }

    await RefundFees.deleteOne({ _id: id, schoolId });

    return res.status(200).json({
      hasError: false,
      message: 'Refund request deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting refund request:', error);
    return res.status(500).json({
      hasError: true,
      message: `Server error while deleting refund request: ${error.message}`,
    });
  }
};

export default deleteRefundRequest;