import TCFormModel from '../../../../models/FeesModule/TCForm.js';
import { TCFormValidator } from '../../../../validators/FeesModule/TcValidator/TCForm.js';

const updateTCFormById = async (req, res) => {
  const { id } = req.params;
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  const { error } = TCFormValidator.validate({ ...req.body, schoolId });
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message,
    });
  }

  try {
    const updatedForm = await TCFormModel.findOneAndUpdate(
      { _id: id, schoolId },
      { ...req.body, schoolId },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({
        hasError: true,
        message: 'TC Form not found.',
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'TC Form updated successfully.',
      form: updatedForm,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default updateTCFormById;
