import mongoose from 'mongoose';
import AdmissionCopy from '../../../../models/FeesModule/AdmissionFormCpy.js';

const getAdmissionByStudentIdAndReceipt = async (req, res) => {
  const { studentId, receiptNumber } = req.params;

  if (!studentId) {
    return res.status(400).json({
      hasError: true,
      message: 'Student ID is required.',
    });
  }

  try {
    const result = await AdmissionCopy.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
        },
      },
      {
        $unwind: {
          path: '$academicHistory',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'admissionpayments',
          let: { studentId: '$studentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    receiptNumber ? { $eq: ['$receiptNumber', receiptNumber] } : {},
                  ],
                },
              },
            },
          ],
          as: 'AdmissionPayment',
        },
      },
      {
        $unwind: {
          path: '$AdmissionPayment',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          'AdmissionPayment.createdAt': 1,
        },
      },
      {
        $project: {
          _id: 1,
          schoolId: 1,
          registrationNumber: 1,
          academicYear: 1,
          studentPhoto: 1,
          firstName: 1,
          middleName: 1,
          lastName: 1,
          dateOfBirth: 1,
          age: 1,
          nationality: 1,
          gender: 1,
          bloodGroup: 1,
          motherTongue: 1,
          currentAddress: 1,
          country: 1,
          state: 1,
          city: 1,
          pincode: 1,
          previousSchoolName: 1,
          previousSchoolBoard: 1,
          addressOfPreviousSchool: 1,
          previousSchoolResult: 1,
          tcCertificate: 1,
          proofOfResidence: 1,
          aadharPassportNumber: 1,
          aadharPassportFile: 1,
          studentCategory: 1,
          castCertificate: 1,
          siblingInfoChecked: 1,
          relationType: 1,
          siblingName: 1,
          idCardFile: 1,
          parentalStatus: 1,
          parentContactNumber: 1,
          fatherName: 1,
          fatherContactNo: 1,
          fatherQualification: 1,
          fatherProfession: 1,
          motherName: 1,
          motherContactNo: 1,
          motherQualification: 1,
          motherProfession: 1,
          agreementChecked: 1,
          applicationDate: 1,
          AdmissionNumber: 1,
          TCStatus: 1,
          TCStatusDate: 1,
          TCStatusYear: 1,
          dropoutStatus: 1,
          dropoutStatusYear: 1,
          dropoutReason: 1,
          createdAt: 1,
          updatedAt: 1,
          masterDefineClass: '$academicHistory.masterDefineClass',
          section: '$academicHistory.section',
          masterDefineShift: '$academicHistory.masterDefineShift',
          studentId: '$AdmissionPayment.studentId',
          paymentSchoolId: '$AdmissionPayment.schoolId',
          admissionFees: '$AdmissionPayment.admissionFees',
          concessionType: '$AdmissionPayment.concessionType',
          concessionAmount: '$AdmissionPayment.concessionAmount',
          finalAmount: '$AdmissionPayment.finalAmount',
          paymentMode: '$AdmissionPayment.paymentMode',
          chequeNumber: '$AdmissionPayment.chequeNumber',
          bankName: '$AdmissionPayment.bankName',
          transactionNumber: '$AdmissionPayment.transactionNumber',
          paymentDate: '$AdmissionPayment.paymentDate',
          name: '$AdmissionPayment.name',
          status: '$AdmissionPayment.status',
          receiptNumber: '$AdmissionPayment.receiptNumber',
          refundReceiptNumbers: '$AdmissionPayment.refundReceiptNumbers',
          reportStatus: '$AdmissionPayment.reportStatus',
          cancelledDate: '$AdmissionPayment.cancelledDate',
          cancelReason: '$AdmissionPayment.cancelReason',
          chequeSpecificReason: '$AdmissionPayment.chequeSpecificReason',
          additionalComment: '$AdmissionPayment.additionalComment',
          paymentCreatedAt: '$AdmissionPayment.createdAt',
          paymentUpdatedAt: '$AdmissionPayment.updatedAt',
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: 'No admission or payment data found for the provided Student ID and Receipt Number.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Admission and payment data fetched successfully.',
      data: result[0],
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error fetching data: ${err.message}`,
    });
  }
};

export default getAdmissionByStudentIdAndReceipt;