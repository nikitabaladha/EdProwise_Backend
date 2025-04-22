import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';

const deleteConcessionFormById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      hasError: true,
      message: 'Concession Form ID is required in params.',
    });
  }

  try {
    const deletedForm = await ConcessionFormModel.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({
        hasError: true,
        message: 'Concession form not found.',
      });
    }

    return res.status(200).json({
      hasError: false,
      message: 'Concession form deleted successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default deleteConcessionFormById;
