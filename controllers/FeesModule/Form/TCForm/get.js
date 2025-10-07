// import TCFormModel from '../../../../models/FeesModule/TCForm.js';

// const getTCFormsBySchoolId = async (req, res) => {
//   const { schoolId,academicYear } = req.params;

//   if (!schoolId || !academicYear) {
//     return res.status(400).json({
//       hasError: true,
//       message: "Both School ID and Academic Year are required.",
//     });
//   }

//   try {
//     const forms = await TCFormModel.find({ schoolId,academicYear });

//     res.status(200).json({
//       hasError: false,
//       message: 'TC Forms retrieved successfully.',
//       data: forms,
//     });
//   } catch (error) {
//     res.status(500).json({
//       hasError: true,
//       message: error.message,
//     });
//   }
// };

// export default getTCFormsBySchoolId;

import TCFormModel from '../../../../models/FeesModule/TCForm.js';
import { TCPayment } from '../../../../models/FeesModule/TCForm.js';

const getTCFormsBySchoolId = async (req, res) => {
  const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: 'Both School ID and Academic Year are required.',
    });
  }

  try {
    // First aggregation: Fetch TC forms with payment details
    const forms = await TCFormModel.aggregate([
      {
        $match: {
          schoolId,
          academicYear,
        },
      },
      {
        $lookup: {
          from: 'tcpayments',
          localField: '_id',
          foreignField: 'tcFormId',
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
        $group: {
          _id: '$_id',
          schoolId: { $first: '$schoolId' },
          academicYear: { $first: '$academicYear' },
          AdmissionNumber: { $first: '$AdmissionNumber' },
          studentPhoto: { $first: '$studentPhoto' },
          firstName: { $first: '$firstName' },
          middleName: { $first: '$middleName' },
          lastName: { $first: '$lastName' },
          dateOfBirth: { $first: '$dateOfBirth' },
          age: { $first: '$age' },
          nationality: { $first: '$nationality' },
          fatherName: { $first: '$fatherName' },
          motherName: { $first: '$motherName' },
          dateOfIssue: { $first: '$dateOfIssue' },
          dateOfAdmission: { $first: '$dateOfAdmission' },
          masterDefineClass: { $first: '$masterDefineClass' },
          percentageObtainInLastExam: { $first: '$percentageObtainInLastExam' },
          qualifiedPromotionInHigherClass: { $first: '$qualifiedPromotionInHigherClass' },
          whetherFaildInAnyClass: { $first: '$whetherFaildInAnyClass' },
          anyOutstandingDues: { $first: '$anyOutstandingDues' },
          moralBehaviour: { $first: '$moralBehaviour' },
          dateOfLastAttendanceAtSchool: { $first: '$dateOfLastAttendanceAtSchool' },
          reasonForLeaving: { $first: '$reasonForLeaving' },
          anyRemarks: { $first: '$anyRemarks' },
          agreementChecked: { $first: '$agreementChecked' },
          certificateNumber: { $first: '$certificateNumber' },
          status: { $first: '$status' },
          applicationDate: { $first: '$applicationDate' },
          reportStatus: { $first: '$reportStatus' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          tcFormId: { $first: '$TCPayment.tcFormId' },
          paymentSchoolId: { $first: '$TCPayment.schoolId' },
          receiptNumber: { $first: '$TCPayment.receiptNumber' },
          TCfees: { $first: '$TCPayment.TCfees' },
          concessionType: { $first: '$TCPayment.concessionType' },
          concessionAmount: { $first: '$TCPayment.concessionAmount' },
          finalAmount: { $first: '$TCPayment.finalAmount' },
          paymentMode: { $first: '$TCPayment.paymentMode' },
          chequeNumber: { $first: '$TCPayment.chequeNumber' },
          bankName: { $first: '$TCPayment.bankName' },
          transactionNumber: { $first: '$TCPayment.transactionNumber' },
          paymentDate: { $first: '$TCPayment.paymentDate' },
          name: { $first: '$TCPayment.name' },
          paymentStatus: { $first: '$TCPayment.status' },
          refundReceiptNumbers: { $first: '$TCPayment.refundReceiptNumbers' },
          paymentReportStatus: { $first: '$TCPayment.reportStatus' },
          paymentCreatedAt: { $first: '$TCPayment.createdAt' },
          paymentUpdatedAt: { $first: '$TCPayment.updatedAt' },
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
          tcFormId: 1,
          paymentSchoolId: 1,
          receiptNumber: 1,
          TCfees: 1,
          concessionType: 1,
          concessionAmount: 1,
          finalAmount: 1,
          paymentMode: 1,
          chequeNumber: 1,
          bankName: 1,
          transactionNumber: 1,
          paymentDate: 1,
          name: 1,
          paymentStatus: 1,
          refundReceiptNumbers: 1,
          paymentReportStatus: 1,
          paymentCreatedAt: 1,
          paymentUpdatedAt: 1,
        },
      },
    ]);

    // Second aggregation: Fetch receipt numbers
    const receiptData = await TCFormModel.aggregate([
      {
        $match: {
          schoolId,
          academicYear,
        },
      },
      {
        $lookup: {
          from: 'tcpayments',
          localField: '_id',
          foreignField: 'tcFormId',
          as: 'TCPayments',
        },
      },
      {
        $project: {
          _id: 1,
          certificateNumber: 1,
          receiptNumbers: {
            $map: {
              input: '$TCPayments',
              as: 'payment',
              in: '$$payment.receiptNumber',
            },
          },
          refundReceiptNumbers: {
            $map: {
              input: '$TCPayments',
              as: 'payment',
              in: '$$payment.refundReceiptNumbers',
            },
          },
          reportStatus: {
            $map: {
              input: '$TCPayments',
              as: 'payment',
              in: '$$payment.reportStatus',
            },
          },
        },
      },
    ]);

    if (!forms || forms.length === 0 || !receiptData || receiptData.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: 'No TC forms or receipt data found for the given School ID and Academic Year.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'TC forms and receipt data fetched successfully.',
      forms,
      receiptData,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message || 'An error occurred while fetching TC forms.',
    });
  }
};

export default getTCFormsBySchoolId;
