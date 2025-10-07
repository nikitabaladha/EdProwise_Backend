import mongoose from 'mongoose';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';

const deleteBoardExamFeePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID provided',
      });
    }

    const payment = await BoardExamFeePayment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Board exam fee payment not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Board exam fee payment deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteBoardExamFeePayment:', error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export default deleteBoardExamFeePayment;