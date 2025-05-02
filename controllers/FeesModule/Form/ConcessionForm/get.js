import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';

const getConcessionFormsBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID is required in params.',
    });
  }

  try {
    const forms = await ConcessionFormModel.find({ schoolId });

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
