// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';

// const getRegistrationsBySchoolIdandyear = async (req, res) => {
//   const { schoolId, academicYear } = req.params;

//   if (!schoolId || !academicYear) {
//     return res.status(400).json({
//       hasError: true,
//       message: "Both School ID and Academic Year are required.",
//     });
//   }

//   try {

//     const students = await StudentRegistration.aggregate([
//       {
//         $match: {
//           schoolId,
//           academicYear,
//         },
//       },
//       {
//         $lookup: {
//           from: 'registrationpayments',
//           localField: '_id',
//           foreignField: 'studentId',
//           as: 'RegistrationPayment',
//         },
//       },
//       {
//         $unwind: {
//           path: '$RegistrationPayment',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $sort: {
//           'RegistrationPayment.createdAt': 1,
//         },
//       },
//       {
//         $group: {
//           _id: '$_id',
//           schoolId: { $first: '$schoolId' },
//           academicYear: { $first: '$academicYear' },
//           firstName: { $first: '$firstName' },
//           middleName: { $first: '$middleName' },
//           lastName: { $first: '$lastName' },
//           dateOfBirth: { $first: '$dateOfBirth' },
//           age: { $first: '$age' },
//           studentPhoto: { $first: '$studentPhoto' },
//           nationality: { $first: '$nationality' },
//           motherTongue: { $first: '$motherTongue' },
//           gender: { $first: '$gender' },
//           bloodGroup: { $first: '$bloodGroup' },
//           masterDefineClass: { $first: '$masterDefineClass' },
//           masterDefineShift: { $first: '$masterDefineShift' },
//           fatherName: { $first: '$fatherName' },
//           fatherContactNo: { $first: '$fatherContactNo' },
//           fatherQualification: { $first: '$fatherQualification' },
//           fatherProfession: { $first: '$fatherProfession' },
//           motherName: { $first: '$motherName' },
//           motherContactNo: { $first: '$motherContactNo' },
//           motherQualification: { $first: '$motherQualification' },
//           motherProfession: { $first: '$motherProfession' },
//           currentAddress: { $first: '$currentAddress' },
//           country: { $first: '$country' },
//           state: { $first: '$state' },
//           city: { $first: '$city' },
//           pincode: { $first: '$pincode' },
//           parentContactNumber: { $first: '$parentContactNumber' },
//           previousSchoolName: { $first: '$previousSchoolName' },
//           previousSchoolBoard: { $first: '$previousSchoolBoard' },
//           addressOfPreviousSchool: { $first: '$addressOfPreviousSchool' },
//           previousSchoolResult: { $first: '$previousSchoolResult' },
//           tcCertificate: { $first: '$tcCertificate' },
//           proofOfResidence: { $first: '$proofOfResidence' },
//           aadharPassportFile: { $first: '$aadharPassportFile' },
//           aadharPassportNumber: { $first: '$aadharPassportNumber' },
//           studentCategory: { $first: '$studentCategory' },
//           castCertificate: { $first: '$castCertificate' },
//           siblingInfoChecked: { $first: '$siblingInfoChecked' },
//           relationType: { $first: '$relationType' },
//           siblingName: { $first: '$siblingName' },
//           idCardFile: { $first: '$idCardFile' },
//           parentalStatus: { $first: '$parentalStatus' },
//           howReachUs: { $first: '$howReachUs' },
//           agreementChecked: { $first: '$agreementChecked' },
//           registrationNumber: { $first: '$registrationNumber' },
//           registrationDate: { $first: '$registrationDate' },
//           createdAt: { $first: '$createdAt' },
//           updatedAt: { $first: '$updatedAt' },
//           studentId: { $first: '$RegistrationPayment.studentId' },
//           paymentSchoolId: { $first: '$RegistrationPayment.schoolId' },
//           paymentRegistrationNumber: { $first: '$RegistrationPayment.registrationNumber' },
//           receiptNumber: { $first: '$RegistrationPayment.receiptNumber' },
//           registrationFee: { $first: '$RegistrationPayment.registrationFee' },
//           concessionType: { $first: '$RegistrationPayment.concessionType' },
//           concessionAmount: { $first: '$RegistrationPayment.concessionAmount' },
//           finalAmount: { $first: '$RegistrationPayment.finalAmount' },
//           paymentMode: { $first: '$RegistrationPayment.paymentMode' },
//           chequeNumber: { $first: '$RegistrationPayment.chequeNumber' },
//           bankName: { $first: '$RegistrationPayment.bankName' },
//           transactionNumber: { $first: '$RegistrationPayment.transactionNumber' },
//           paymentDate: { $first: '$RegistrationPayment.paymentDate' },
//           name: { $first: '$RegistrationPayment.name' },
//           status: { $first: '$RegistrationPayment.status' },
//           refundReceiptNumbers: { $first: '$RegistrationPayment.refundReceiptNumbers' },
//           reportStatus: { $first: '$RegistrationPayment.reportStatus' },
//           paymentCreatedAt: { $first: '$RegistrationPayment.createdAt' },
//           paymentUpdatedAt: { $first: '$RegistrationPayment.updatedAt' },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           schoolId: 1,
//           academicYear: 1,
//           firstName: 1,
//           middleName: 1,
//           lastName: 1,
//           dateOfBirth: 1,
//           age: 1,
//           studentPhoto: 1,
//           motherTongue: 1,
//           nationality: 1,
//           gender: 1,
//           bloodGroup: 1,
//           masterDefineClass: 1,
//           masterDefineShift: 1,
//           fatherName: 1,
//           fatherContactNo: 1,
//           fatherQualification: 1,
//           fatherProfession: 1,
//           motherName: 1,
//           motherContactNo: 1,
//           motherQualification: 1,
//           motherProfession: 1,
//           currentAddress: 1,
//           country: 1,
//           state: 1,
//           city: 1,
//           pincode: 1,
//           parentContactNumber: 1,
//           previousSchoolName: 1,
//           previousSchoolBoard: 1,
//           addressOfPreviousSchool: 1,
//           previousSchoolResult: 1,
//           tcCertificate: 1,
//           proofOfResidence: 1,
//           aadharPassportFile: 1,
//           aadharPassportNumber: 1,
//           studentCategory: 1,
//           castCertificate: 1,
//           siblingInfoChecked: 1,
//           relationType: 1,
//           siblingName: 1,
//           idCardFile: 1,
//           parentalStatus: 1,
//           howReachUs: 1,
//           agreementChecked: 1,
//           registrationNumber: 1,
//           registrationDate: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           studentId: 1,
//           paymentSchoolId: 1,
//           paymentRegistrationNumber: 1,
//           receiptNumber: 1,
//           registrationFee: 1,
//           concessionType: 1,
//           concessionAmount: 1,
//           finalAmount: 1,
//           paymentMode: 1,
//           chequeNumber: 1,
//           bankName: 1,
//           transactionNumber: 1,
//           paymentDate: 1,
//           name: 1,
//           status: 1,
//           refundReceiptNumbers: 1,
//           reportStatus: 1,
//           paymentCreatedAt: 1,
//           paymentUpdatedAt: 1,
//         },
//       },
//     ]);

//     // Second aggregation: Fetch receipt numbers
//     const receiptData = await StudentRegistration.aggregate([
//       {
//         $match: {
//           schoolId,
//           academicYear,
//         },
//       },
//       {
//         $lookup: {
//           from: 'registrationpayments',
//           localField: '_id',
//           foreignField: 'studentId',
//           as: 'RegistrationPayments',
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           registrationNumber: 1,
        
//            receiptNumbers: {
//             $map: {
//               input: '$RegistrationPayments',
//               as: 'payment',
//               in: '$$payment.receiptNumber',
//             },
//           },
//             refundreceiptNumbers: {
//             $map: {
//               input: '$RegistrationPayments',
//               as: 'payment',
//               in: '$$payment.refundReceiptNumbers',
//             },
//           },
//             reportStatus: {
//                $map: {
//               input: '$RegistrationPayments',
//               as: 'payment',
//               in: '$$payment.reportStatus',
//             },
//           },
//         },
//       },
//     ]);

 
//     if (!students || students.length === 0 || !receiptData || receiptData.length === 0) {
//       return res.status(404).json({
//         hasError: true,
//         message: 'No students or receipt data found for the given School ID and Academic Year.',
//       });
//     }

//     // Send combined response
//     res.status(200).json({
//       hasError: false,
//       message: 'Student and receipt data fetched successfully.',
//       students,
//       receiptData,
//     });
//   } catch (err) {
//     res.status(500).json({
//       hasError: true,
//       message: err.message,
//     });
//   }
// };

// export default getRegistrationsBySchoolIdandyear;


import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';

const getRegistrationsBySchoolIdandyear = async (req, res) => {
  const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: "Both School ID and Academic Year are required.",
    });
  }

  try {
   
    const students = await StudentRegistration.aggregate([
      { $match: { schoolId, academicYear } },

 
      {
        $lookup: {
          from: 'registrationpayments',
          localField: '_id',
          foreignField: 'studentId',
          as: 'payments',
        },
      },


      {
        $addFields: {
          payments: {
            $filter: {
              input: '$payments',
              as: 'p',
              cond: { $ne: ['$$p.status', 'Failed'] },
            },
          },
        },
      },

      {
        $unwind: {
          path: '$payments',
          preserveNullAndEmptyArrays: true,
        },
      },

      { $sort: { 'payments.createdAt': 1 } },


      {
        $group: {
          _id: '$_id',
          schoolId: { $first: '$schoolId' },
          academicYear: { $first: '$academicYear' },
          firstName: { $first: '$firstName' },
          middleName: { $first: '$middleName' },
          lastName: { $first: '$lastName' },
          dateOfBirth: { $first: '$dateOfBirth' },
          age: { $first: '$age' },
          studentPhoto: { $first: '$studentPhoto' },
          nationality: { $first: '$nationality' },
          motherTongue: { $first: '$motherTongue' },
          gender: { $first: '$gender' },
          bloodGroup: { $first: '$bloodGroup' },
          masterDefineClass: { $first: '$masterDefineClass' },
          masterDefineShift: { $first: '$masterDefineShift' },
          fatherName: { $first: '$fatherName' },
          fatherContactNo: { $first: '$fatherContactNo' },
          fatherQualification: { $first: '$fatherQualification' },
          fatherProfession: { $first: '$fatherProfession' },
          motherName: { $first: '$motherName' },
          motherContactNo: { $first: '$motherContactNo' },
          motherQualification: { $first: '$motherQualification' },
          motherProfession: { $first: '$motherProfession' },
          currentAddress: { $first: '$currentAddress' },
          country: { $first: '$country' },
          state: { $first: '$state' },
          city: { $first: '$city' },
          pincode: { $first: '$pincode' },
          parentContactNumber: { $first: '$parentContactNumber' },
          previousSchoolName: { $first: '$previousSchoolName' },
          previousSchoolBoard: { $first: '$previousSchoolBoard' },
          addressOfPreviousSchool: { $first: '$addressOfPreviousSchool' },
          previousSchoolResult: { $first: '$previousSchoolResult' },
          tcCertificate: { $first: '$tcCertificate' },
          proofOfResidence: { $first: '$proofOfResidence' },
          aadharPassportFile: { $first: '$aadharPassportFile' },
          aadharPassportNumber: { $first: '$aadharPassportNumber' },
          studentCategory: { $first: '$studentCategory' },
          castCertificate: { $first: '$castCertificate' },
          siblingInfoChecked: { $first: '$siblingInfoChecked' },
          relationType: { $first: '$relationType' },
          siblingName: { $first: '$siblingName' },
          idCardFile: { $first: '$idCardFile' },
          parentalStatus: { $first: '$parentalStatus' },
          howReachUs: { $first: '$howReachUs' },
          agreementChecked: { $first: '$agreementChecked' },
          registrationNumber: { $first: '$registrationNumber' },
          registrationDate: { $first: '$registrationDate' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },

          studentId: { $first: '$payments.studentId' },
          paymentSchoolId: { $first: '$payments.schoolId' },
          paymentRegistrationNumber: { $first: '$payments.registrationNumber' },
          receiptNumber: { $first: '$payments.receiptNumber' },
          registrationFee: { $first: '$payments.registrationFee' },
          concessionType: { $first: '$payments.concessionType' },
          concessionAmount: { $first: '$payments.concessionAmount' },
          finalAmount: { $first: '$payments.finalAmount' },
          paymentMode: { $first: '$payments.paymentMode' },
          chequeNumber: { $first: '$payments.chequeNumber' },
          bankName: { $first: '$payments.bankName' },
          transactionNumber: { $first: '$payments.transactionNumber' },
          paymentDate: { $first: '$payments.paymentDate' },
          name: { $first: '$payments.name' },
          status: { $first: '$payments.status' },
          refundReceiptNumbers: { $first: '$payments.refundReceiptNumbers' },
          reportStatus: { $first: '$payments.reportStatus' },
          paymentCreatedAt: { $first: '$payments.createdAt' },
          paymentUpdatedAt: { $first: '$payments.updatedAt' },
        },
      },
      { $project: { payments: 0 } },
    ]);


    const receiptData = await StudentRegistration.aggregate([
      { $match: { schoolId, academicYear } },

      {
        $lookup: {
          from: 'registrationpayments',
          localField: '_id',
          foreignField: 'studentId',
          as: 'payments',
        },
      },

      {
        $addFields: {
          payments: {
            $filter: {
              input: '$payments',
              as: 'p',
              cond: { $ne: ['$$p.status', 'Failed'] },
            },
          },
        },
      },

      {
        $project: {
          _id: 1,
          registrationNumber: 1,
          receiptNumbers: {
            $map: {
              input: '$payments',
              as: 'p',
              in: '$$p.receiptNumber',
            },
          },
          refundreceiptNumbers: {
            $map: {
              input: '$payments',
              as: 'p',
              in: '$$p.refundReceiptNumbers',
            },
          },
          reportStatus: {
            $map: {
              input: '$payments',
              as: 'p',
              in: '$$p.reportStatus',
            },
          },
        },
      },
    ]);

    
    if (!students?.length && !receiptData?.length) {
      return res.status(404).json({
        hasError: true,
        message: 'No data found for the given School ID and Academic Year.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Student and receipt data fetched successfully.',
      students,
      receiptData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default getRegistrationsBySchoolIdandyear;