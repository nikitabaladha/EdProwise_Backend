import mongoose from 'mongoose';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';

const deleteBoardRegistrationFeePayment = async (req, res) => {
  try {
    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID provided',
      });
    }


    const payment = await BoardRegistrationFeePayment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Board registration fee payment not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Board registration fee payment deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteBoardRegistrationFeePayment:', error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export default deleteBoardRegistrationFeePayment;