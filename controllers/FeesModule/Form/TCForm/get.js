import TCFormModel from '../../../../models/FeesModule/TCForm.js';

const getTCFormsBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({
      hasError: true,
      message: 'School ID is required.',
    });
  }

  try {
    const forms = await TCFormModel.find({ schoolId });

    res.status(200).json({
      hasError: false,
      message: 'TC Forms retrieved successfully.',
      data: forms,
    });
  } catch (error) {
    res.status(500).json({
      hasError: true,
      message: error.message,
    });
  }
};

export default getTCFormsBySchoolId;
