import RefundFees from '../../../../models/FeesModule/RefundFees.js';

const getStudentFeeBalance = async (req, res) => {
  const { schoolId, academicYear, feeType, registrationNumber, admissionNumber } = req.query;


  if (!schoolId || !academicYear || !feeType || (!registrationNumber && !admissionNumber)) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID, Academic Year, Fee Type, and either Registration Number or Admission Number are required.',
    });
  }


  const feeTypes = ['Registration Fees', 'Admission Fees', 'School Fees', 'Board Registration Fees', 'Board Exam Fees'];
  if (!feeTypes.includes(feeType)) {
    return res.status(400).json({
      hasError: true,
      message: `Invalid fee type. Must be one of: ${feeTypes.join(', ')}`,
    });
  }

  try {

    const query = {
      schoolId,
      academicYear,
      refundType: feeType,
    };


    if (registrationNumber) {
      query.registrationNumber = registrationNumber;
    } else {
      query.admissionNumber = admissionNumber;
    }


    const refundRecords = await RefundFees.find(query)
      .select('registrationNumber admissionNumber firstName lastName refundType paidAmount refundAmount balance academicYear')
      .lean();

    if (!refundRecords.length) {
      return res.status(404).json({
        hasError: true,
        message: 'No refund records found for the specified student and fee type.',
      });
    }

    const totalBalance = refundRecords.reduce((sum, record) => sum + (record.balance || 0), 0);

  
    const responseData = {
      student: {
        firstName: refundRecords[0].firstName,
        lastName: refundRecords[0].lastName,
        registrationNumber: refundRecords[0].registrationNumber || null,
        admissionNumber: refundRecords[0].admissionNumber || null,
      },
      feeType,
      academicYear,
      totalBalance,
      details: refundRecords.map(record => ({
        receiptNumber: record.receiptNumber,
        paidAmount: record.paidAmount,
        refundAmount: record.refundAmount,
        balance: record.balance,
        status: record.status,
        refundDate: record.refundDate,
      })),
    };

    res.status(200).json({
      hasError: false,
      message: 'Balance fetched successfully.',
      data: responseData,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error fetching balance: ${err.message}`,
    });
  }
};

export default getStudentFeeBalance;