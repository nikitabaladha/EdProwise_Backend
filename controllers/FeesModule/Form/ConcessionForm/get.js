import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';

const getConcessionFormsBySchoolId = async (req, res) => {
  const { schoolId,academicYear } = req.params;

  if (!schoolId || !academicYear) {
    return res.status(400).json({
      hasError: true,
      message: "Both School ID and Academic Year are required.",
    });
  }

  try {
    const forms = await ConcessionFormModel.find({ schoolId,academicYear });

    return res.status(200).json({
      hasError: false,
      message: 'Concession forms fetched successfully.',
      forms,
    });
  } catch (err) {
    return res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default getConcessionFormsBySchoolId;
