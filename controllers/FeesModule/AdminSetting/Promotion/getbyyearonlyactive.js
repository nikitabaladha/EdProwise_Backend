

import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

const getAdmissionFormsBySchoolId = async (req, res) => {
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
          academicYear: academicYear.toString(),
           TCStatus: 'Active',
        },
      },
      {
        $unwind: '$academicHistory',
      },
      {
        $match: {
          'academicHistory.academicYear': academicYear.toString(),
        },
      },
      {
        $project: {
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
          masterDefineClass: '$academicHistory.masterDefineClass',
          section: '$academicHistory.section',
          masterDefineShift: '$academicHistory.masterDefineShift',
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
          admissionFees: 1,
          concessionAmount: 1,
          concessionType: 1,
          finalAmount: 1,
          name: 1,
          paymentMode: 1,
          chequeNumber: 1,
          bankName: 1,
          paymentDate: 1,
          transactionNumber: 1,
          receiptNumber: 1,
          status: 1,
          applicationDate: 1,
          AdmissionNumber: 1,
          cancelledDate: 1,
          cancelReason: 1,
          chequeSpecificReason: 1,
          additionalComment: 1,
          createdAt: 1,
          updatedAt: 1,
          TCStatus:1,
          __v: 1,
        },
      },
    ]);

    if (!forms.length) {
      return res.status(404).json({
        hasError: true,
        message: `No admission forms found for school ID: ${schoolId} and academic year: ${academicYear}`,
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

export default getAdmissionFormsBySchoolId;
