import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

const getAdmissionFormsByAcdemicHistoryYear = async (req, res) => {
  const { schoolId, academicYear } = req.params;

  if (!schoolId) {
    return res.status(400).json({ hasError: true, message: 'School ID is required.' });
  }

  if (!academicYear) {
    return res.status(400).json({ hasError: true, message: 'Academic Year is required.' });
  }

  try {
    const forms = await AdmissionFormModel.aggregate([
      {
        $match: {
          schoolId: schoolId.toString(),
          'academicHistory.academicYear': academicYear.toString(),
        },
      },
      {
        $unwind: '$academicHistory',
      },
      {
        $lookup: {
          from: 'classandsections',
          let: {
            classId: '$academicHistory.masterDefineClass',
            year: '$academicHistory.academicYear'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$classId'] },
                    { $eq: ['$schoolId', schoolId] },
                    { $eq: ['$academicYear', '$$year'] }  
                  ],
                },
              },
            },
            {
              $project: {
                className: 1,
                _id: 1
              },
            },
          ],
          as: 'classInfo',
        },
      }
      ,
      {
        $lookup: {
          from: 'classandsections',
          let: {
            classId: '$academicHistory.masterDefineClass',
            sectionId: '$academicHistory.section',
            year: '$academicHistory.academicYear'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$classId'] },
                    { $eq: ['$schoolId', schoolId] },
                    { $eq: ['$academicYear', '$$year'] } 
                  ],
                },
              },
            },
            { $unwind: '$sections' },
            {
              $match: {
                $expr: {
                  $eq: ['$sections._id', '$$sectionId'],
                },
              },
            },
            {
              $project: {
                sectionName: '$sections.name',
                sectionId: '$sections._id',
              },
            },
          ],
          as: 'sectionInfo',
        },
      },
      {
        $group: {
          _id: '$_id',
          schoolId: { $first: '$schoolId' },
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
          academicHistory: {
            $push: {
              academicYear: '$academicHistory.academicYear',
              masterDefineClass: '$academicHistory.masterDefineClass', 
              section: '$academicHistory.section',
              masterDefineShift: '$academicHistory.masterDefineShift',
              _id: '$academicHistory._id',
              className: { $arrayElemAt: ['$classInfo.className', 0] },
              sectionName: { $arrayElemAt: ['$sectionInfo.sectionName', 0] },
            },
          },
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
          admissionFees: { $first: '$admissionFees' },
          concessionAmount: { $first: '$concessionAmount' },
          concessionType: { $first: '$concessionType' },
          finalAmount: { $first: '$finalAmount' },
          name: { $first: '$name' },
          paymentMode: { $first: '$paymentMode' },
          chequeNumber: { $first: '$chequeNumber' },
          bankName: { $first: '$bankName' },
          paymentDate: { $first: '$paymentDate' },
          transactionNumber: { $first: '$transactionNumber' },
          receiptNumber: { $first: '$receiptNumber' },
          status: { $first: '$status' },
          applicationDate: { $first: '$applicationDate' },
          AdmissionNumber: { $first: '$AdmissionNumber' },
          cancelledDate: { $first: '$cancelledDate' },
          cancelReason: { $first: '$cancelReason' },
          chequeSpecificReason: { $first: '$chequeSpecificReason' },
          additionalComment: { $first: '$additionalComment' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          TCStatus: { $first: '$TCStatus' },
          TCStatusYear: { $first: '$TCStatusYear' },
          TCStatusDate: { $first: '$TCStatusDate' },
          dropoutStatus: { $first: '$dropoutStatus' },
          dropoutStatusYear: { $first: '$dropoutStatusYear' },
          dropoutReason: { $first: '$dropoutReason' },
          __v: { $first: '$__v' },
        },
      },
      {
        $project: {
          schoolId: { $ifNull: ['$schoolId', ''] },
          registrationNumber: { $ifNull: ['$registrationNumber', ''] },
          academicYear: { $ifNull: ['$academicYear', ''] },
          studentPhoto: { $ifNull: ['$studentPhoto', ''] },
          firstName: { $ifNull: ['$firstName', ''] },
          middleName: { $ifNull: ['$middleName', ''] },
          lastName: { $ifNull: ['$lastName', ''] },
          dateOfBirth: { $ifNull: ['$dateOfBirth', ''] },
          age: { $ifNull: ['$age', ''] },
          nationality: { $ifNull: ['$nationality', ''] },
          gender: { $ifNull: ['$gender', ''] },
          bloodGroup: { $ifNull: ['$bloodGroup', ''] },
          academicHistory: {
            $map: {
              input: '$academicHistory',
              as: 'history',
              in: {
                academicYear: '$$history.academicYear',
                classId: '$$history.masterDefineClass', 
                sectionId: '$$history.section', 
                className: { $ifNull: ['$$history.className', ''] },
                sectionName: { $ifNull: ['$$history.sectionName', ''] },
                masterDefineShift: '$$history.masterDefineShift',
                _id: '$$history._id',
              },
            },
          },
          motherTongue: { $ifNull: ['$motherTongue', ''] },
          currentAddress: { $ifNull: ['$currentAddress', ''] },
          country: { $ifNull: ['$country', ''] },
          state: { $ifNull: ['$state', ''] },
          city: { $ifNull: ['$city', ''] },
          pincode: { $ifNull: ['$pincode', ''] },
          previousSchoolName: { $ifNull: ['$previousSchoolName', ''] },
          previousSchoolBoard: { $ifNull: ['$previousSchoolBoard', ''] },
          addressOfPreviousSchool: { $ifNull: ['$addressOfPreviousSchool', ''] },
          previousSchoolResult: { $ifNull: ['$previousSchoolResult', ''] },
          tcCertificate: { $ifNull: ['$tcCertificate', ''] },
          proofOfResidence: { $ifNull: ['$proofOfResidence', ''] },
          aadharPassportNumber: { $ifNull: ['$aadharPassportNumber', ''] },
          aadharPassportFile: { $ifNull: ['$aadharPassportFile', ''] },
          studentCategory: { $ifNull: ['$studentCategory', ''] },
          castCertificate: { $ifNull: ['$castCertificate', ''] },
          siblingInfoChecked: { $ifNull: ['$siblingInfoChecked', false] },
          relationType: { $ifNull: ['$relationType', ''] },
          siblingName: { $ifNull: ['$siblingName', ''] },
          idCardFile: { $ifNull: ['$idCardFile', ''] },
          parentalStatus: { $ifNull: ['$parentalStatus', ''] },
          parentContactNumber: { $ifNull: ['$parentContactNumber', ''] },
          fatherName: { $ifNull: ['$fatherName', ''] },
          fatherContactNo: { $ifNull: ['$fatherContactNo', ''] },
          fatherQualification: { $ifNull: ['$fatherQualification', ''] },
          fatherProfession: { $ifNull: ['$fatherProfession', ''] },
          motherName: { $ifNull: ['$motherName', ''] },
          motherContactNo: { $ifNull: ['$motherContactNo', ''] },
          motherQualification: { $ifNull: ['$motherQualification', ''] },
          motherProfession: { $ifNull: ['$motherProfession', ''] },
          agreementChecked: { $ifNull: ['$agreementChecked', false] },
          admissionFees: { $ifNull: ['$admissionFees', 0] },
          concessionAmount: { $ifNull: ['$concessionAmount', 0] },
          concessionType: { $ifNull: ['$concessionType', ''] },
          finalAmount: { $ifNull: ['$finalAmount', 0] },
          name: { $ifNull: ['$name', ''] },
          paymentMode: { $ifNull: ['$paymentMode', ''] },
          chequeNumber: { $ifNull: ['$chequeNumber', ''] },
          bankName: { $ifNull: ['$bankName', ''] },
          paymentDate: { $ifNull: ['$paymentDate', ''] },
          transactionNumber: { $ifNull: ['$transactionNumber', ''] },
          receiptNumber: { $ifNull: ['$receiptNumber', ''] },
          status: { $ifNull: ['$status', ''] },
          applicationDate: { $ifNull: ['$applicationDate', ''] },
          AdmissionNumber: { $ifNull: ['$AdmissionNumber', ''] },
          cancelledDate: { $ifNull: ['$cancelledDate', ''] },
          cancelReason: { $ifNull: ['$cancelReason', ''] },
          chequeSpecificReason: { $ifNull: ['$chequeSpecificReason', ''] },
          additionalComment: { $ifNull: ['$additionalComment', ''] },
          createdAt: { $ifNull: ['$createdAt', ''] },
          updatedAt: { $ifNull: ['$updatedAt', ''] },
          TCStatus: { $ifNull: ['$TCStatus', ''] },
          TCStatusYear: { $ifNull: ['$TCStatusYear', ''] },
          TCStatusDate: { $ifNull: ['$TCStatusDate', ''] },
          dropoutStatus: { $ifNull: ['$dropoutStatus', ''] },
          dropoutStatusYear: { $ifNull: ['$dropoutStatusYear', ''] },
          dropoutReason: { $ifNull: ['$dropoutReason', ''] },
          __v: { $ifNull: ['$__v', ''] },
        },
      },
      {
        $sort: {
          academicYear: 1,
        },
      },
    ]);

    if (!forms.length) {
      return res.status(404).json({
        hasError: true,
        message: `No admission forms found for school ID: ${schoolId} and academic year: ${academicYear} in academicHistory`,
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Admission forms retrieved successfully.',
      data: forms,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error retrieving admission forms: ${err.message}`,
    });
  }
};

export default getAdmissionFormsByAcdemicHistoryYear;