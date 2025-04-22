import TCFormModel from '../../../../models/FeesModule/TCForm.js';

const deleteTCFormById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      hasError: true,
      message: 'TC Form ID is required.',
    });
  }

  try {
    const deletedForm = await TCFormModel.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({
        hasError: true,
        message: 'TC Form not found.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'TC Form deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      hasError: true,
      message: error.message,
    });
  }
};

export default deleteTCFormById;
