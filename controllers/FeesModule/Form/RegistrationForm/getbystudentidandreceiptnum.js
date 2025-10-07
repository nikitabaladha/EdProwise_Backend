import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import mongoose from 'mongoose';

const getStudentAndPaymentData = async (req, res) => {
  const { studentId, receiptNumber } = req.params;


  if (!studentId) {
    return res.status(400).json({
      hasError: true,
      message: 'Student ID is required.',
    });
  }

  try {

    const result = await StudentRegistration.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(studentId),
        },
      },
      {
        $lookup: {
          from: 'registrationpayments',
          let: { studentId: '$_id' },
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
          as: 'RegistrationPayment',
        },
      },
      {
        $unwind: {
          path: '$RegistrationPayment',
          preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $sort: {
          'RegistrationPayment.createdAt': 1, 
        },
      },
      {
        $project: {
          _id: 1,
          schoolId: 1,
          academicYear: 1,
          firstName: 1,
          middleName: 1,
          lastName: 1,
          dateOfBirth: 1,
          age: 1,
          studentPhoto: 1,
          motherTongue: 1,
          nationality: 1,
          gender: 1,
          bloodGroup: 1,
          masterDefineClass: 1,
          masterDefineShift: 1,
          fatherName: 1,
          fatherContactNo: 1,
          fatherQualification: 1,
          fatherProfession: 1,
          motherName: 1,
          motherContactNo: 1,
          motherQualification: 1,
          motherProfession: 1,
          currentAddress: 1,
          country: 1,
          state: 1,
          city: 1,
          pincode: 1,
          parentContactNumber: 1,
          previousSchoolName: 1,
          previousSchoolBoard: 1,
          addressOfPreviousSchool: 1,
          previousSchoolResult: 1,
          tcCertificate: 1,
          proofOfResidence: 1,
          aadharPassportFile: 1,
          aadharPassportNumber: 1,
          studentCategory: 1,
          castCertificate: 1,
          siblingInfoChecked: 1,
          relationType: 1,
          siblingName: 1,
          idCardFile: 1,
          parentalStatus: 1,
          howReachUs: 1,
          agreementChecked: 1,
          registrationNumber: 1,
          registrationDate: 1,
          createdAt: 1,
          updatedAt: 1,
          studentId: '$RegistrationPayment.studentId',
          paymentSchoolId: '$RegistrationPayment.schoolId',
          paymentRegistrationNumber: '$RegistrationPayment.registrationNumber',
          receiptNumber: '$RegistrationPayment.receiptNumber',
          registrationFee: '$RegistrationPayment.registrationFee',
          concessionType: '$RegistrationPayment.concessionType',
          concessionAmount: '$RegistrationPayment.concessionAmount',
          finalAmount: '$RegistrationPayment.finalAmount',
          paymentMode: '$RegistrationPayment.paymentMode',
          chequeNumber: '$RegistrationPayment.chequeNumber',
          bankName: '$RegistrationPayment.bankName',
          transactionNumber: '$RegistrationPayment.transactionNumber',
          paymentDate: '$RegistrationPayment.paymentDate',
          name: '$RegistrationPayment.name',
          status: '$RegistrationPayment.status',
          refundReceiptNumbers: '$RegistrationPayment.refundReceiptNumbers',
          reportStatus: '$RegistrationPayment.reportStatus',
          paymentCreatedAt: '$RegistrationPayment.createdAt',
          paymentUpdatedAt: '$RegistrationPayment.updatedAt',
        },
      },
    ]);

  
    if (!result || result.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: 'No student or payment data found for the provided Student ID and Receipt Number.',
      });
    }


    res.status(200).json({
      hasError: false,
      message: 'Student and payment data fetched successfully.',
      data: result[0], 
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error fetching data: ${err.message}`,
    });
  }
};

export default getStudentAndPaymentData;