  import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';

  const getBoardExamFeePayments = async (req, res) => {
    try {
      const { schoolId, academicYear } = req.params;

      if (!schoolId || !academicYear) {
        return res.status(400).json({
          success: false,
          message: 'School ID and academic year are required',
        });
      }

      const student = await BoardExamFeePayment.find({
        schoolId: schoolId,
        academicYear,
      });

      if (!student || student.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No board exam fee payments found for the given school ID and academic year',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Board exam fee payments retrieved successfully',
        data: student,
      });
    } catch (error) {
      console.error('Error in getBoardExamFeePayments:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  };

  export default getBoardExamFeePayments;