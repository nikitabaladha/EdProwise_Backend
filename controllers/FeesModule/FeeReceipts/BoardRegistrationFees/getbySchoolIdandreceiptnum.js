import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';

const getBoardRegistrationPaymentData = async (req, res) => {
  const { schoolId, receiptNumberBrf } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID is required.',
    });
  }

  try {
    const query = { schoolId };
    if (receiptNumberBrf) {
      query.receiptNumberBrf = receiptNumberBrf;
    }

    const result = await BoardRegistrationFeePayment.find(query).select({
      _id: 1,
      schoolId: 1,
      academicYear: 1,
      admissionId: 1,
      admissionNumber: 1,
      firstName: 1,
      lastName: 1,
      classId: 1,
      sectionId: 1,
      className: 1,
      sectionName: 1,
      finalAmount: 1,
      paymentMode: 1,
      paymentDate: 1,
      status: 1,
      transactionId: 1,
      chequeNumber: 1,
      bankName: 1,
      receiptNumberBrf: 1,
      cancelledDate: 1,
      cancelReason: 1,
      chequeSpecificReason: 1,
      additionalComment: 1,
      reportStatus: 1,
      refundReceiptNumbers: 1,
      createdAt: 1,
      updatedAt: 1,
    }).sort({ createdAt: 1 });

    if (!result || result.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: 'No board registration payment data found for the provided School ID and Receipt Number.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Board registration payment data fetched successfully.',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error fetching data: ${err.message}`,
    });
  }
};

export default getBoardRegistrationPaymentData;