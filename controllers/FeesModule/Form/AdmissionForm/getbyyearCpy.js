


// import mongoose from 'mongoose';
// import AdmissionCopy from '../../../../models/FeesModule/AdmissionFormCpy.js'; 


// const getAdmissionFormsBySchoolId = async (req, res) => {
//   const { schoolId, academicYear } = req.params;

//   if (!schoolId) {
//     return res.status(400).json({ hasError: true, message: 'School ID is required.' });
//   }

//   if (!academicYear) {
//     return res.status(400).json({ hasError: true, message: 'Academic Year is required.' });
//   }

//   try {
//     const students = await AdmissionCopy.aggregate([
//       {
//         $match: {
//           schoolId: schoolId.toString(),
//           academicYear: academicYear.toString(),
//         },
//       },
//       {
//         $unwind: {
//           path: '$academicHistory',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $match: {
//           'academicHistory.academicYear': academicYear.toString(),
//         },
//       },
//       {
//         $lookup: {
//           from: 'admissionpayments', 
//           localField: 'studentId', 
//           foreignField: 'studentId',
//           as: 'AdmissionPayment',
//         },
//       },
//       {
//         $unwind: {
//           path: '$AdmissionPayment',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $sort: {
//           'AdmissionPayment.createdAt': 1,
//         },
//       },
//       {
//         $group: {
//           _id: '$_id',
//           schoolId: { $first: '$schoolId' },
//           studentId: { $first: '$studentId' }, 
//           registrationNumber: { $first: '$registrationNumber' },
//           academicYear: { $first: '$academicYear' },
//           studentPhoto: { $first: '$studentPhoto' },
//           firstName: { $first: '$firstName' },
//           middleName: { $first: '$middleName' },
//           lastName: { $first: '$lastName' },
//           dateOfBirth: { $first: '$dateOfBirth' },
//           age: { $first: '$age' },
//           nationality: { $first: '$nationality' },
//           gender: { $first: '$gender' },
//           bloodGroup: { $first: '$bloodGroup' },
//           motherTongue: { $first: '$motherTongue' },
//           currentAddress: { $first: '$currentAddress' },
//           country: { $first: '$country' },
//           state: { $first: '$state' },
//           city: { $first: '$city' },
//           pincode: { $first: '$pincode' },
//           previousSchoolName: { $first: '$previousSchoolName' },
//           previousSchoolBoard: { $first: '$previousSchoolBoard' },
//           addressOfPreviousSchool: { $first: '$addressOfPreviousSchool' },
//           previousSchoolResult: { $first: '$previousSchoolResult' },
//           tcCertificate: { $first: '$tcCertificate' },
//           proofOfResidence: { $first: '$proofOfResidence' },
//           aadharPassportNumber: { $first: '$aadharPassportNumber' },
//           aadharPassportFile: { $first: '$aadharPassportFile' },
//           studentCategory: { $first: '$studentCategory' },
//           castCertificate: { $first: '$castCertificate' },
//           siblingInfoChecked: { $first: '$siblingInfoChecked' },
//           relationType: { $first: '$relationType' },
//           siblingName: { $first: '$siblingName' },
//           idCardFile: { $first: '$idCardFile' },
//           parentalStatus: { $first: '$parentalStatus' },
//           parentContactNumber: { $first: '$parentContactNumber' },
//           fatherName: { $first: '$fatherName' },
//           fatherContactNo: { $first: '$fatherContactNo' },
//           fatherQualification: { $first: '$fatherQualification' },
//           fatherProfession: { $first: '$fatherProfession' },
//           motherName: { $first: '$motherName' },
//           motherContactNo: { $first: '$motherContactNo' },
//           motherQualification: { $first: '$motherQualification' },
//           motherProfession: { $first: '$motherProfession' },
//           agreementChecked: { $first: '$agreementChecked' },
//           applicationDate: { $first: '$applicationDate' },
//           AdmissionNumber: { $first: '$AdmissionNumber' },
//             receiptNumber: { $first: '$AdmissionPayment.receiptNumber' },
//           TCStatus: { $first: '$TCStatus' },
//           TCStatusDate: { $first: '$TCStatusDate' },
//           TCStatusYear: { $first: '$TCStatusYear' },
//           dropoutStatus: { $first: '$dropoutStatus' },
//           dropoutStatusYear: { $first: '$dropoutStatusYear' },
//           dropoutReason: { $first: '$dropoutReason' },
//           createdAt: { $first: '$createdAt' },
//           updatedAt: { $first: '$updatedAt' },
//           masterDefineClass: { $first: '$academicHistory.masterDefineClass' },
//           section: { $first: '$academicHistory.section' },
//           masterDefineShift: { $first: '$academicHistory.masterDefineShift' },
//           // studentId: { $first: '$AdmissionPayment.studentId' },
//           paymentSchoolId: { $first: '$AdmissionPayment.schoolId' },
//           admissionFees: { $first: '$AdmissionPayment.admissionFees' },
//           concessionType: { $first: '$AdmissionPayment.concessionType' },
//           concessionAmount: { $first: '$AdmissionPayment.concessionAmount' },
//           finalAmount: { $first: '$AdmissionPayment.finalAmount' },
//           paymentMode: { $first: '$AdmissionPayment.paymentMode' },
//           chequeNumber: { $first: '$AdmissionPayment.chequeNumber' },
//           bankName: { $first: '$AdmissionPayment.bankName' },
//           transactionNumber: { $first: '$AdmissionPayment.transactionNumber' },
//           paymentDate: { $first: '$AdmissionPayment.paymentDate' },
//           name: { $first: '$AdmissionPayment.name' },
//           status: { $first: '$AdmissionPayment.status' },
//           refundReceiptNumbers: { $first: '$AdmissionPayment.refundReceiptNumbers' },
//           reportStatus: { $first: '$AdmissionPayment.reportStatus' },
//           cancelledDate: { $first: '$AdmissionPayment.cancelledDate' },
//           cancelReason: { $first: '$AdmissionPayment.cancelReason' },
//           chequeSpecificReason: { $first: '$AdmissionPayment.chequeSpecificReason' },
//           additionalComment: { $first: '$AdmissionPayment.additionalComment' },
//           paymentCreatedAt: { $first: '$AdmissionPayment.createdAt' },
//           paymentUpdatedAt: { $first: '$AdmissionPayment.updatedAt' },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           schoolId: 1,
//           studentId: 1, 
//           registrationNumber: 1,
//           academicYear: 1,
//           studentPhoto: 1,
//           firstName: 1,
//           middleName: 1,
//           lastName: 1,
//           dateOfBirth: 1,
//           age: 1,
//           nationality: 1,
//           gender: 1,
//           bloodGroup: 1,
//           motherTongue: 1,
//           currentAddress: 1,
//           country: 1,
//           state: 1,
//           city: 1,
//           pincode: 1,
//           previousSchoolName: 1,
//           previousSchoolBoard: 1,
//           addressOfPreviousSchool: 1,
//           previousSchoolResult: 1,
//           tcCertificate: 1,
//           proofOfResidence: 1,
//           aadharPassportNumber: 1,
//           aadharPassportFile: 1,
//           studentCategory: 1,
//           castCertificate: 1,
//           siblingInfoChecked: 1,
//           relationType: 1,
//           siblingName: 1,
//           idCardFile: 1,
//           parentalStatus: 1,
//           parentContactNumber: 1,
//           fatherName: 1,
//           fatherContactNo: 1,
//           fatherQualification: 1,
//           fatherProfession: 1,
//           motherName: 1,
//           motherContactNo: 1,
//           motherQualification: 1,
//           motherProfession: 1,
//           agreementChecked: 1,
//           applicationDate: 1,
//           AdmissionNumber: 1,
//           receiptNumber:1,
//           TCStatus: 1,
//           TCStatusDate: 1,
//           TCStatusYear: 1,
//           dropoutStatus: 1,
//           dropoutStatusYear: 1,
//           dropoutReason: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           masterDefineClass: 1,
//           section: 1,
//           masterDefineShift: 1,
//           studentId: 1,
//           paymentSchoolId: 1,
//           admissionFees: 1,
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
//           cancelledDate: 1,
//           cancelReason: 1,
//           chequeSpecificReason: 1,
//           additionalComment: 1,
//           paymentCreatedAt: 1,
//           paymentUpdatedAt: 1,
//         },
//       },
//     ]);


//     const receiptData = await AdmissionCopy.aggregate([
//       {
//         $match: {
//           schoolId: schoolId.toString(),
//           academicYear: academicYear.toString(),
//         },
//       },
//       {
//         $lookup: {
//           from: 'admissionpayments',
//           localField: 'studentId', 
//           foreignField: 'studentId',
//           as: 'AdmissionPayments',
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           AdmissionNumber: 1,
//           receiptNumbers: {
//             $map: {
//               input: '$AdmissionPayments',
//               as: 'payment',
//               in: '$$payment.receiptNumber',
//             },
//           },
//           refundReceiptNumbers: {
//             $map: {
//               input: '$AdmissionPayments',
//               as: 'payment',
//               in: '$$payment.refundReceiptNumbers',
//             },
//           },
//           reportStatus: {
//             $map: {
//               input: '$AdmissionPayments',
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
//         message: 'No admission forms or receipt data found for the given School ID and Academic Year.',
//       });
//     }

//     res.status(200).json({
//       hasError: false,
//       message: 'Admission forms and receipt data fetched successfully.',
//       students,
//       receiptData,
//     });
//   } catch (err) {
//     res.status(500).json({
//       hasError: true,
//       message: `Error retrieving admission forms: ${err.message}`,
//     });
//   }
// };

// export default getAdmissionFormsBySchoolId;

import AdmissionCopy from '../../../../models/FeesModule/AdmissionFormCpy.js';

const getAdmissionFormsBySchoolId = async (req, res) => {
  const { schoolId, academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID and Academic Year are required.',
    });
  }

  try {



    const students = await AdmissionCopy.aggregate([

      {
        $match: {
          schoolId: schoolId.toString(),
          academicYear: academicYear.toString(),
        },
      },


      {
        $unwind: {
          path: '$academicHistory',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'academicHistory.academicYear': academicYear.toString(),
        },
      },


      {
        $lookup: {
          from: 'admissionpayments',
          let: { studentId: '$studentId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$studentId', '$$studentId'] },
                status: { $ne: 'Failed' },
              },
            },
            { $sort: { createdAt: 1 } },
          ],
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


      {
        $group: {
          _id: '$_id',
          schoolId: { $first: '$schoolId' },
          studentId: { $first: '$studentId' },
          registrationNumber: { $first: '$registrationNumber' },
          academicYear: { $first: '$academicYear' },
          studentPhoto: { $first: '$studentPhoto' },
          firstName: { $first: '$firstName' },
          middleName: { $first: '$middleName' },
          lastName: { $first: '$lastName' },
          dateOfBirth: { $first: '$dateOfBirth' },
          age: { $first: '$age' },
          nationality: { $first: '$nationality' },
          gender: { $first: '$gender' },
          bloodGroup: { $first: '$bloodGroup' },
          motherTongue: { $first: '$motherTongue' },
          currentAddress: { $first: '$currentAddress' },
          country: { $first: '$country' },
          state: { $first: '$state' },
          city: { $first: '$city' },
          pincode: { $first: '$pincode' },
          previousSchoolName: { $first: '$previousSchoolName' },
          previousSchoolBoard: { $first: '$previousSchoolBoard' },
          addressOfPreviousSchool: { $first: '$addressOfPreviousSchool' },
          previousSchoolResult: { $first: '$previousSchoolResult' },
          tcCertificate: { $first: '$tcCertificate' },
          proofOfResidence: { $first: '$proofOfResidence' },
          aadharPassportNumber: { $first: '$aadharPassportNumber' },
          aadharPassportFile: { $first: '$aadharPassportFile' },
          studentCategory: { $first: '$studentCategory' },
          castCertificate: { $first: '$castCertificate' },
          siblingInfoChecked: { $first: '$siblingInfoChecked' },
          relationType: { $first: '$relationType' },
          siblingName: { $first: '$siblingName' },
          idCardFile: { $first: '$idCardFile' },
          parentalStatus: { $first: '$parentalStatus' },
          parentContactNumber: { $first: '$parentContactNumber' },
          fatherName: { $first: '$fatherName' },
          fatherContactNo: { $first: '$fatherContactNo' },
          fatherQualification: { $first: '$fatherQualification' },
          fatherProfession: { $first: '$fatherProfession' },
          motherName: { $first: '$motherName' },
          motherContactNo: { $first: '$motherContactNo' },
          motherQualification: { $first: '$motherQualification' },
          motherProfession: { $first: '$motherProfession' },
          agreementChecked: { $first: '$agreementChecked' },
          applicationDate: { $first: '$applicationDate' },
          AdmissionNumber: { $first: '$AdmissionNumber' },
          TCStatus: { $first: '$TCStatus' },
          TCStatusDate: { $first: '$TCStatusDate' },
          TCStatusYear: { $first: '$TCStatusYear' },
          dropoutStatus: { $first: '$dropoutStatus' },
          dropoutStatusYear: { $first: '$dropoutStatusYear' },
          dropoutReason: { $first: '$dropoutReason' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },


          masterDefineClass: { $first: '$academicHistory.masterDefineClass' },
          section: { $first: '$academicHistory.section' },
          masterDefineShift: { $first: '$academicHistory.masterDefineShift' },


          receiptNumber: { $first: '$payments.receiptNumber' },
          paymentSchoolId: { $first: '$payments.schoolId' },
          admissionFees: { $first: '$payments.admissionFees' },
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
          cancelledDate: { $first: '$payments.cancelledDate' },
          cancelReason: { $first: '$payments.cancelReason' },
          chequeSpecificReason: { $first: '$payments.chequeSpecificReason' },
          additionalComment: { $first: '$payments.additionalComment' },
          paymentCreatedAt: { $first: '$payments.createdAt' },
          paymentUpdatedAt: { $first: '$payments.updatedAt' },
        },
      },


      { $project: { payments: 0 } },
    ]);




    const receiptData = await AdmissionCopy.aggregate([
      {
        $match: {
          schoolId: schoolId.toString(),
          academicYear: academicYear.toString(),
        },
      },
      {
        $lookup: {
          from: 'admissionpayments',
          let: { studentId: '$studentId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$studentId', '$$studentId'] },
                status: { $ne: 'Failed' },
              },
            },
          ],
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
          AdmissionNumber: 1,
          receiptNumbers: {
            $map: { input: '$payments', as: 'p', in: '$$p.receiptNumber' },
          },
          refundReceiptNumbers: {
            $map: { input: '$payments', as: 'p', in: '$$p.refundReceiptNumbers' },
          },
          reportStatus: {
            $map: { input: '$payments', as: 'p', in: '$$p.reportStatus' },
          },
        },
      },
    ]);




    if (!students?.length) {
      return res.status(404).json({
        hasError: true,
        message: 'No admission forms found for the given School ID and Academic Year.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Admission forms and receipt data fetched successfully.',
      students,
      receiptData,
    });
  } catch (err) {
    console.error('getAdmissionFormsBySchoolId error:', err);
    res.status(500).json({
      hasError: true,
      message: `Error: ${err.message}`,
    });
  }
};

export default getAdmissionFormsBySchoolId;