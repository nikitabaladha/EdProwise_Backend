import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import mongoose from 'mongoose';

const getRegistrationsBySchoolIdandyear = async (req, res) => {
  const { schoolId, academicYear, id } = req.params;


  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: "Both School ID and Academic Year are required.",
    });
  }


  const matchCondition = { schoolId, academicYear };
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        hasError: true,
        message: "Invalid student ID format.",
      });
    }
    matchCondition._id = new mongoose.Types.ObjectId(id);
  }

  try {

    const students = await StudentRegistration.aggregate([
      { $match: matchCondition },

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


    if (!students.length && !receiptData.length) {
      return res.status(404).json({
        hasError: true,
        message: 'No registrations found for the given School ID and Academic Year.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Student and receipt data fetched successfully.',
      students,
      receiptData,
    });
  } catch (err) {
    console.error('Error in getRegistrationsBySchoolIdandyear:', err);
    res.status(500).json({
      hasError: true,
      message: 'Internal server error.',
      error: err.message,
    });
  }
};

export default getRegistrationsBySchoolIdandyear;