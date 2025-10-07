import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

const getAdmissionFormsWithStudentDetails = async (req, res) => {
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
          _id: 1,
          schoolId: 1,
          AdmissionNumber: 1,
          firstName: 1,
          lastName: 1,
          gender: 1,
          academicYear: '$academicHistory.academicYear',
          academicHistory: {
            _id: '$academicHistory._id',
            academicYear: '$academicHistory.academicYear',
            masterDefineClass: '$academicHistory.masterDefineClass',
            section: '$academicHistory.section',
            masterDefineShift: '$academicHistory.masterDefineShift',
          },
        },
      },
    ]);

    if (!forms.length) {
      return res.status(404).json({
        hasError: true,
        message: `No admission forms found for school ID: ${schoolId}, academic year: ${academicYear}, and TCStatus: Active`,
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Admission forms with student details retrieved successfully.',
      data: forms,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error retrieving admission forms: ${err.message}`,
    });
  }
};

export default getAdmissionFormsWithStudentDetails;