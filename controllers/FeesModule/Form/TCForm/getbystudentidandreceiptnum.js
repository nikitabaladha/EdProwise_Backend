import mongoose from 'mongoose';
import TCFormModel from '../../../../models/FeesModule/TCForm.js';


const getTCFormAndPaymentData = async (req, res) => {
  const { tcFormId, receiptNumber } = req.params;

  if (!tcFormId || !mongoose.isValidObjectId(tcFormId)) {
    return res.status(400).json({
      hasError: true,
      message: 'Valid TC Form ID is required.',
    });
  }

  try {
    const result = await TCFormModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(tcFormId),
        },
      },
      {
        $lookup: {
          from: 'tcpayments',
          let: { tcFormId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tcFormId', '$$tcFormId'] },
                    receiptNumber ? { $eq: ['$receiptNumber', receiptNumber] } : {},
                  ],
                },
              },
            },
          ],
          as: 'TCPayment',
        },
      },
      {
        $unwind: {
          path: '$TCPayment',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          'TCPayment.createdAt': 1,
        },
      },
      {
        $project: {
          _id: 1,
          schoolId: 1,
          academicYear: 1,
          AdmissionNumber: 1,
          studentPhoto: 1,
          firstName: 1,
          middleName: 1,
          lastName: 1,
          dateOfBirth: 1,
          age: 1,
          nationality: 1,
          fatherName: 1,
          motherName: 1,
          dateOfIssue: 1,
          dateOfAdmission: 1,
          masterDefineClass: 1,
          percentageObtainInLastExam: 1,
          qualifiedPromotionInHigherClass: 1,
          whetherFaildInAnyClass: 1,
          anyOutstandingDues: 1,
          moralBehaviour: 1,
          dateOfLastAttendanceAtSchool: 1,
          reasonForLeaving: 1,
          anyRemarks: 1,
          agreementChecked: 1,
          certificateNumber: 1,
          status: 1,
          applicationDate: 1,
          reportStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          tcFormId: '$TCPayment.tcFormId',
          paymentSchoolId: '$TCPayment.schoolId',
          receiptNumber: '$TCPayment.receiptNumber',
          TCfees: '$TCPayment.TCfees',
          concessionType: '$TCPayment.concessionType',
          concessionAmount: '$TCPayment.concessionAmount',
          finalAmount: '$TCPayment.finalAmount',
          paymentMode: '$TCPayment.paymentMode',
          chequeNumber: '$TCPayment.chequeNumber',
          bankName: '$TCPayment.bankName',
          transactionNumber: '$TCPayment.transactionNumber',
          easebuzzTxnId:'$TCPayment.easebuzzTxnId',
          easebuzzId: '$TCPayment.easebuzzId',
          hash:'$TCPayment.hash',
          paymentDate: '$TCPayment.paymentDate',
          name: '$TCPayment.name',
          paymentStatus: '$TCPayment.status',
          refundReceiptNumbers: '$TCPayment.refundReceiptNumbers',
          paymentReportStatus: '$TCPayment.reportStatus',
          paymentCreatedAt: '$TCPayment.createdAt',
          paymentUpdatedAt: '$TCPayment.updatedAt',
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: 'No TC form or payment data found for the provided TC Form ID and Receipt Number.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'TC form and payment data fetched successfully.',
      data: result[0],
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error fetching data: ${err.message}`,
    });
  }
};

export default getTCFormAndPaymentData;